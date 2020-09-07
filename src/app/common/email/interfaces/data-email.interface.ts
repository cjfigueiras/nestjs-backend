export interface IDataEmail {
    readonly to: string;
    readonly from: string;
    readonly template: string;
    readonly language?: string;
    readonly dynamicTemplateData: any;
}
