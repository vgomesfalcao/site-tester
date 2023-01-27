"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crawler_1 = require("./crawler");
const crawler = new crawler_1.Crawler('resources/sitemap/sitemap.xml');
crawler.navigateAndTakePrint();
crawler.createCSVFile();
//# sourceMappingURL=main.js.map