export declare class Crawler {
    private parser;
    private siteMapPath;
    dirname: string;
    constructor(siteMapPath: string);
    navigateAndTakePrint(): Promise<void>;
    private getUrlList;
    private createFilePath;
}
