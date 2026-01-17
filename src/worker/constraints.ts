export type Constraint = {
  vars: number[];
  sum: number;
};

export type Frontier = {
  vars: number[];
  constraints: Constraint[];
};
