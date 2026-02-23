export type Currency = 'usd';

export type FrequencyPerWeek = 1 | 2 | 3;
export type CommitmentMonths = 1 | 2 | 3;

export type ProgramKey =
  | 'position'
  | 'team_position'
  | 'team_strength'
  | 'team_combination'
  | 'combination'
  | 'strength'
  | 'unknown';

export type CatalogOption<T extends string | number> = {
  value: T;
  label: string;
};

export type PricingRow = {
  frequencyPerWeek: FrequencyPerWeek;
  commitmentMonths: CommitmentMonths;
  amountCents: number;
};

export type PricingProgram = {
  programKey: ProgramKey;
  programName: string;
  currency: Currency;
  isTeam: boolean;
  teamMinPlayers?: number;
  dropInFeeCents?: number;
  prices: PricingRow[];
};

export type PricingExtracted = {
  sourcePdf: string;
  catalog: {
    programOptions: CatalogOption<Exclude<ProgramKey, 'unknown'>>[];
    frequencyOptions: CatalogOption<FrequencyPerWeek>[];
    commitmentOptions: CatalogOption<CommitmentMonths>[];
  };
  programs: PricingProgram[];
};

export type StripePriceMappingRow = PricingRow & {
  stripePriceId: string | null;
};

export type StripeProgramMapping = Omit<PricingProgram, 'prices'> & {
  stripeProductId: string | null;
  stripeDropInPriceId?: string;
  prices: StripePriceMappingRow[];
};

export type PricingStripeMapping = {
  sourcePdf?: string;
  generatedAt: string;
  inputFile?: string;
  dryRun: boolean;
  programs: StripeProgramMapping[];
};

export type PricingSelection = {
  programKey: Exclude<ProgramKey, 'unknown'>;
  frequencyPerWeek: FrequencyPerWeek;
  commitmentMonths: CommitmentMonths;
};
