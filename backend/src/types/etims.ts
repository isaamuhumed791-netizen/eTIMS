export interface EtimsSalesItem {
  itemCd: string;
  itemClsCd: string;
  itemNm: string;
  qty: number;
  prc: number;
  splyAmt: number;
  taxTyCd: string;
  taxAmt: number;
  totAmt: number;
}

export interface EtimsSalesInvoicePayload {
  tin: string;
  bhfId: string;
  cmcKey: string;
  invcNo: number;
  orgInvcNo: number;
  cisInvcNo?: string;
  salesTyCd: string;
  rcptTyCd: string;
  pmtTyCd: string;
  salesSttsCd: string;
  salesDt: string;
  stockRlsDt?: string;
  totItemCnt: number;
  taxblAmtA: number;
  taxblAmtB: number;
  taxblAmtC: number;
  taxblAmtD: number;
  taxRtA: number;
  taxRtB: number;
  taxRtC: number;
  taxRtD: number;
  taxAmtA: number;
  taxAmtB: number;
  taxAmtC: number;
  taxAmtD: number;
  totTaxblAmt: number;
  totTaxAmt: number;
  totAmt: number;
  prcInclTaxAmt: number;
  itemList: EtimsSalesItem[];
}