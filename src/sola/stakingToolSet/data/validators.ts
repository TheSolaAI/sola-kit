export interface ValidatorInfo {
  name: string;
  address: string;
  type: 'native' | 'liquid';
  description?: string;
}

export const validators: ValidatorInfo[] = [
  {
    name: 'Jupiter',
    address: 'CatzoSMUkTRidT5DwBxAC2pEtnwMBTpkCepHkFgZDiqb',
    type: 'native',
  },
  {
    name: 'Helius',
    address: 'he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk',
    type: 'native',
  },
  {
    name: 'Solflare',
    address: 'EXhYxF25PJEHb3v5G1HY8Jn8Jm7bRjJtaxEghGrUuhQw',
    type: 'native',
  },
  {
    name: 'Marinade',
    address: 'MNDEFzGvMt87ueuHvVU9Uc7qsY5S3FvZqKxZqKxZqKxZ',
    type: 'liquid',
  },
  {
    name: 'Lido',
    address: 'LidoVtXgBxQxKxZqKxZqKxZqKxZqKxZqKxZqKxZqKxZ',
    type: 'liquid',
  },
];
