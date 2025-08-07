export function checkIsRupiah(priceString: string): boolean {
  return priceString.startsWith('Rp');
}

export function convertRupiahToNumber(
  rupiahString?: string,
): string | number | undefined {
  if (!rupiahString || !checkIsRupiah(rupiahString)) {
    return rupiahString;
  }

  const cleanedString = rupiahString.replace(/[Rp.\s]/g, '');
  const numberValue = parseInt(cleanedString, 10);
  return isNaN(numberValue) ? rupiahString : numberValue;
}
