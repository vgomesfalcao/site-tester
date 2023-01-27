"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const fs_1 = require("fs");
const puppeteer_1 = __importDefault(require("puppeteer"));
const url_1 = require("url");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
class Crawler {
    constructor(siteMapPath) {
        this._parser = new fast_xml_parser_1.XMLParser();
        this._printDirname = './export/printscreen/';
        this._csvDirname = './export/doc/';
        this._siteMapPath = siteMapPath;
        this.getUrlPathsList();
    }
    navigateAndTakePrint() {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this._urls;
            if (!(0, fs_1.existsSync)(this._printDirname)) {
                (0, fs_1.mkdirSync)(this._printDirname, { recursive: true });
            }
            ;
            (() => __awaiter(this, void 0, void 0, function* () {
                const browser = yield puppeteer_1.default.launch();
                const page = yield browser.newPage();
                for (const path of paths) {
                    const filepath = this.createFilePath(path);
                    yield page.goto(path, { waitUntil: 'networkidle2' });
                    yield page.screenshot({
                        path: filepath,
                        fullPage: true,
                    });
                }
                yield browser.close();
            }))();
        });
    }
    getUrlPathsList() {
        let siteMapObject = this._parser.parse((0, fs_1.readFileSync)(this._siteMapPath));
        let _urls = [];
        for (const item of siteMapObject['urlset']['url']) {
            _urls.push(item['loc']);
        }
        this._urls = _urls.slice(0, 3);
    }
    createFilePath(path) {
        const url = new url_1.URL(path);
        if (url.pathname == '/') {
            return `${this._printDirname}${url.host.replaceAll('.', '_')}.png`;
        }
        const filePath = `${this._printDirname}${url.host.replaceAll('.', '_')}_${url.pathname.slice(1).replaceAll('/', '-')}.png`;
        return filePath;
    }
    generateRecords() {
        let records = [];
        this._urls.forEach((element) => {
            records.push({
                url: element,
                imgPath: this.createFilePath(element),
            });
        });
        return records;
    }
    createCSVFile() {
        if (!(0, fs_1.existsSync)(this._csvDirname)) {
            (0, fs_1.mkdirSync)(this._csvDirname, { recursive: true });
        }
        const csvWriter = createCsvWriter({
            path: this._csvDirname + 'test.csv',
            header: [
                { id: 'url', title: 'URL' },
                { id: 'imgPath', title: 'IMG' },
            ],
        });
        const records = this.generateRecords();
        csvWriter.writeRecords(records).then(() => {
            console.log('...Done');
        });
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=crawler.js.map