import argparse
import json
import logging
import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

import pdfplumber


@dataclass(frozen=True)
class PriceRow:
    frequency_per_week: int
    commitment_months: int
    amount_cents: int


def _money_to_cents(money: str) -> int:
    cleaned = money.strip().replace("$", "")
    try:
        value = Decimal(cleaned)
    except InvalidOperation as exc:
        raise ValueError(f"Invalid money value: {money!r}") from exc
    return int((value * 100).to_integral_value())


def _infer_program_key(page_text: str) -> str:
    text = page_text.lower()
    if "team position" in text:
        return "team_position"
    if "team strength" in text:
        return "team_strength"
    if "team combination" in text:
        return "team_combination"
    if "position training" in text:
        return "position"
    # Order matters: page may contain the word 'training' many times.
    if "combination training" in text:
        return "combination"
    if "strength training" in text:
        return "strength"
    return "unknown"


def _program_name(program_key: str) -> str:
    return {
        "position": "Position Training",
        "team_position": "Team Position Training",
        "team_strength": "Team Strength Training",
        "team_combination": "Team Combination Training",
        "combination": "Combination Training",
        "strength": "Strength Training",
    }.get(program_key, program_key)


def _parse_page(page_text: str) -> dict[str, Any]:
    lines = [ln.strip() for ln in (page_text or "").splitlines() if ln.strip()]
    joined = "\n".join(lines)

    program_key = _infer_program_key(joined)
    program_name = _program_name(program_key)
    is_team = "teams are" in joined.lower() or program_key.startswith("team_")
    team_min_players = 8 if is_team else None

    drop_in_fee_cents: int | None = None
    drop_in_match = re.search(r"\$\s*(\d+(?:\.\d{2})?)\s*\nDrop-in\s*\nFee", joined)
    if drop_in_match:
        drop_in_fee_cents = _money_to_cents(drop_in_match.group(1))

    prices: list[PriceRow] = []
    current_frequency: int | None = None
    for line in lines:
        freq_match = re.match(r"x(\d)\s*/\s*Week", line)
        if freq_match:
            current_frequency = int(freq_match.group(1))
            continue

        month_match = re.match(r"(\d)\s*-\s*Month\s*\$\s*(\d+(?:\.\d{2})?)", line)
        if month_match and current_frequency is not None:
            commitment_months = int(month_match.group(1))
            amount_cents = _money_to_cents(month_match.group(2))
            prices.append(
                PriceRow(
                    frequency_per_week=current_frequency,
                    commitment_months=commitment_months,
                    amount_cents=amount_cents,
                )
            )

    prices_sorted = sorted(prices, key=lambda p: (p.frequency_per_week, p.commitment_months))
    return {
        "programKey": program_key,
        "programName": program_name,
        "currency": "usd",
        "isTeam": is_team,
        **({"teamMinPlayers": team_min_players} if team_min_players else {}),
        **({"dropInFeeCents": drop_in_fee_cents} if drop_in_fee_cents is not None else {}),
        "prices": [
            {
                "frequencyPerWeek": p.frequency_per_week,
                "commitmentMonths": p.commitment_months,
                "amountCents": p.amount_cents,
            }
            for p in prices_sorted
        ],
    }


def _build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Extract pricing tables from the LPA pricing PDF")
    parser.add_argument(
        "--pdf",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "Pricing Sheet- LifePrep Academy.pdf",
        help="Path to the pricing PDF",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "docs" / "pricing.extracted.json",
        help="Where to write extracted pricing JSON",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Print JSON to stdout instead of writing a file",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Print extracted page text and money tokens for troubleshooting",
    )
    return parser


def main() -> None:
    args = _build_arg_parser().parse_args()

    if not args.debug:
        logging.getLogger("pdfminer").setLevel(logging.ERROR)

    pdf_path: Path = args.pdf
    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    extracted_pages: list[dict[str, Any]] = []
    debug_text_parts: list[str] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            if args.debug:
                debug_text_parts.append(f"\n--- page {page_number} ---\n{text}")
            extracted_pages.append(_parse_page(text))

    program_options = [
        {
            "value": p["programKey"],
            "label": p.get("programName") or p["programKey"],
        }
        for p in extracted_pages
        if p["programKey"] != "unknown"
    ]
    frequency_options = [{"value": 1, "label": "1x / week"}, {"value": 2, "label": "2x / week"}, {"value": 3, "label": "3x / week"}]
    commitment_options = [{"value": 1, "label": "1 month"}, {"value": 2, "label": "2 months"}, {"value": 3, "label": "3 months"}]

    payload: dict[str, Any] = {
        "sourcePdf": str(pdf_path.name),
        "catalog": {
            "programOptions": program_options,
            "frequencyOptions": frequency_options,
            "commitmentOptions": commitment_options,
        },
        "programs": extracted_pages,
    }

    if args.debug:
        full_text = "\n".join(debug_text_parts)
        print(full_text)
        print("\n\n== MONEY TOKENS ==")
        for token in re.findall(r"\$\s*\d+(?:\.\d{2})?", full_text):
            print(token)

    json_text = json.dumps(payload, indent=2, sort_keys=False)
    if args.stdout:
        print(json_text)
        return

    out_path: Path = args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json_text + "\n", encoding="utf-8")
    print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()
