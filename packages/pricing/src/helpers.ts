import type {
  CommitmentMonths,
  FrequencyPerWeek,
  PricingExtracted,
  PricingProgram,
  PricingSelection,
  PricingStripeMapping,
  StripeProgramMapping,
} from './types';

export function getProgram(extracted: PricingExtracted, programKey: string): PricingProgram | undefined {
  return extracted.programs.find((p) => p.programKey === programKey);
}

export function getAmountCentsForSelection(extracted: PricingExtracted, selection: PricingSelection): number | undefined {
  const program = getProgram(extracted, selection.programKey);
  if (!program) return undefined;

  return program.prices.find(
    (p) =>
      p.frequencyPerWeek === selection.frequencyPerWeek &&
      p.commitmentMonths === selection.commitmentMonths,
  )?.amountCents;
}

export function getStripeProgram(mapping: PricingStripeMapping, programKey: string): StripeProgramMapping | undefined {
  return mapping.programs.find((p) => p.programKey === programKey);
}

export function getStripePriceIdForSelection(
  mapping: PricingStripeMapping,
  selection: PricingSelection,
): string | undefined {
  const program = getStripeProgram(mapping, selection.programKey);
  if (!program) return undefined;

  const row = program.prices.find(
    (p) =>
      p.frequencyPerWeek === selection.frequencyPerWeek &&
      p.commitmentMonths === selection.commitmentMonths,
  );

  return row?.stripePriceId ?? undefined;
}

export function assertValidFrequency(value: number): asserts value is FrequencyPerWeek {
  if (value !== 1 && value !== 2 && value !== 3) throw new Error(`Invalid frequencyPerWeek: ${value}`);
}

export function assertValidCommitment(value: number): asserts value is CommitmentMonths {
  if (value !== 1 && value !== 2 && value !== 3) throw new Error(`Invalid commitmentMonths: ${value}`);
}
