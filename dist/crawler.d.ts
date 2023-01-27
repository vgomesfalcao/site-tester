export declare class Crawler {
    private _parser;
    private _siteMapPath;
    private _urls;
    private _printDirname;
    private _csvDirname;
    constructor(siteMapPath: string);
    navigateAndTakePrint(): Promise<void>;
    private getUrlPathsList;
    private createFilePath;
    private generateRecords;
    createCSVFile(): void;
}
