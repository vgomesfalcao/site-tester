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
class Crawler {
    constructor(siteMapPath) {
        this.parser = new fast_xml_parser_1.XMLParser();
        this.dirname = './printscreen/';
        this.siteMapPath = siteMapPath;
    }
    navigateAndTakePrint() {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.getUrlList().slice(0, 3);
            if (!(0, fs_1.existsSync)(this.dirname)) {
                (0, fs_1.mkdirSync)(this.dirname);
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
    getUrlList() {
        let siteMapObject = this.parser.parse((0, fs_1.readFileSync)(this.siteMapPath));
        let siteMapUrls = [];
        for (const item of siteMapObject['urlset']['url']) {
            siteMapUrls.push(item['loc']);
        }
        return siteMapUrls;
    }
    createFilePath(path) {
        const url = new url_1.URL(path);
        if (url.pathname == '/') {
            return `${this.dirname}${url.host.replaceAll('.', '_')}.png`;
        }
        const filePath = `${this.dirname}${url.host.replaceAll('.', '_')}_${url.pathname.slice(1).replaceAll('/', '-')}.png`;
        return filePath;
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=crawler.js.map