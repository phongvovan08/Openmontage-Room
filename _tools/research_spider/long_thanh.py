import scrapy


class LongThanhSpider(scrapy.Spider):
    name = "long_thanh_sources"
    allowed_domains = [
        "vanban.chinhphu.vn",
        "datafiles.chinhphu.vn",
        "caa.gov.vn",
        "acv.vn",
    ]
    start_urls = [
        "https://vanban.chinhphu.vn/?docid=212234&pageid=27160",
        "https://vanban.chinhphu.vn/?pageid=27160&docid=208031",
        "https://caa.gov.vn/van-ban/648-qd-ttg-28523.htm",
        "https://caa.gov.vn/van-ban/648-qd-ttg-28627.htm",
        "https://acv.vn/tin-tuc/tuyen-dung/thong-bao-tuyen-dung-lao-dong-cang-hang-khong-quoc-te-long-thanh",
    ]

    custom_settings = {
        "ROBOTSTXT_OBEY": True,
        "DOWNLOAD_DELAY": 1.0,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,
        "AUTOTHROTTLE_ENABLED": True,
        "AUTOTHROTTLE_START_DELAY": 1.0,
        "AUTOTHROTTLE_MAX_DELAY": 8.0,
        "RETRY_TIMES": 2,
        "FEEDS": {
            "projects/long-thanh-40km/artifacts/scrapy-sources.jsonl": {
                "format": "jsonlines",
                "encoding": "utf8",
                "overwrite": True,
            }
        },
        "LOG_LEVEL": "INFO",
        "USER_AGENT": "OpenMontageResearchBot/1.0 (+https://github.com/OpenMontageInc/OpenMontage)",
    }

    def parse(self, response):
        text = " ".join(
            part.strip()
            for part in response.css("body *::text").getall()
            if part and part.strip()
        )
        text = " ".join(text.split())
        pdf_links = response.css('a[href$=".pdf"]::attr(href)').getall()
        useful_links = []
        for href in response.css("a::attr(href)").getall():
            if not href:
                continue
            absolute = response.urljoin(href)
            if any(token in absolute.lower() for token in ("long-thanh", "longthanh", "648-ttg", "1711-ttg")):
                useful_links.append(absolute)

        yield {
            "requested_url": response.request.url,
            "final_url": response.url,
            "status": response.status,
            "content_type": response.headers.get("Content-Type", b"").decode("latin1"),
            "title": " ".join(response.css("title::text").getall()).strip(),
            "text": text[:50000],
            "pdf_links": list(dict.fromkeys(response.urljoin(link) for link in pdf_links)),
            "related_links": list(dict.fromkeys(useful_links))[:50],
        }
