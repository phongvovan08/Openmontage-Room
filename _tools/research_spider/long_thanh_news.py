import scrapy


class LongThanhNewsSpider(scrapy.Spider):
    """Crawl public Government/CAAC/ACV pages about Long Thanh airport.

    Scope: public document and news pages only. robots.txt is obeyed, requests
    are throttled, and no attempt is made to bypass login walls or bot checks.
    """

    name = "long_thanh_news"
    allowed_domains = [
        "baochinhphu.vn",
        "en.baochinhphu.vn",
        "vanban.chinhphu.vn",
        "datafiles.chinhphu.vn",
        "caa.gov.vn",
        "acv.vn",
    ]
    start_urls = [
        "https://baochinhphu.vn/lo-trinh-chuyen-doi-khai-thac-2-san-bay-long-thanh-va-tan-son-nhat-tu-1-12-2026-102260728153635254.htm",
        "https://baochinhphu.vn/day-nhanh-tien-do-thi-cong-san-bay-long-thanh-va-cao-toc-tphcm-long-thanh-dau-giay-102260525211615704.htm",
        "https://en.baochinhphu.vn/long-thanh-intl-airport-set-for-commercial-launch-by-late-2026-111260330102151795.htm",
        "https://baochinhphu.vn/khuyen-khich-cac-hang-hang-khong-chuyen-bay-quoc-te-sang-san-bay-long-thanh-tu-he-2026-102250929194105721.htm",
        "https://baochinhphu.vn/bo-xay-dung-bao-cao-ve-phuong-an-khai-thac-san-bay-long-thanh-102251002182442016.htm",
        "https://baochinhphu.vn/dua-san-bay-long-thanh-thanh-trung-tam-trung-chuyen-hang-khong-cua-dong-nam-bo-102250811211058025.htm",
        "https://baochinhphu.vn/pho-thu-tuong-thuong-truc-pham-gia-tuc-kiem-tra-tien-do-du-an-san-bay-long-thanh-va-cao-toc-tphcm-long-thanh-dau-giay-102260523190527671.htm",
        "https://baochinhphu.vn/de-xuat-chuyen-toan-bo-chuyen-bay-quoc-te-ve-san-bay-long-thanh-102250812144928916.htm",
        "https://baochinhphu.vn/chot-moc-hoan-thanh-nha-ga-t3-tan-son-nhat-va-san-bay-long-thanh-102240827154757836.htm",
        "https://baochinhphu.vn/thu-tuong-san-bay-long-thanh-phai-hoan-thanh-trong-nam-2025-khong-the-cham-hon-102241203111257112.htm",
    ]

    custom_settings = {
        "ROBOTSTXT_OBEY": True,
        "DOWNLOAD_DELAY": 1.5,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,
        "AUTOTHROTTLE_ENABLED": True,
        "AUTOTHROTTLE_START_DELAY": 1.5,
        "AUTOTHROTTLE_MAX_DELAY": 10.0,
        "RETRY_TIMES": 2,
        "FEEDS": {
            "projects/long-thanh-40km/artifacts/scrapy-news.jsonl": {
                "format": "jsonlines",
                "encoding": "utf8",
                "mode": "overwrite",
            }
        },
        "LOG_LEVEL": "INFO",
        "USER_AGENT": "OpenMontageResearchBot/1.0 (+https://github.com/OpenMontageInc/OpenMontage)",
    }

    def parse(self, response):
        title = " ".join(response.css("title::text").getall()).strip()
        parts = []
        for selector in (
            ".article__body p::text",
            ".detail__body p::text",
            "article p::text",
            ".ft-article p::text",
            "main p::text",
        ):
            parts = response.css(selector).getall()
            if parts:
                break
        if not parts:
            parts = response.css("body p::text").getall()
        text = " ".join(" ".join(parts).split())

        published = response.css(
            'meta[property="article:published_time"]::attr(content), '
            'meta[name="date"]::attr(content), '
            'meta[name="publishdate"]::attr(content)'
        ).getall()
        if not published:
            published = response.css(".date::text, time::text").getall()

        yield {
            "requested_url": response.request.url,
            "final_url": response.url,
            "status": response.status,
            "title": title,
            "published": " ".join(p.strip() for p in published if p.strip())[:200],
            "text": text[:30000],
            "text_len": len(text),
        }
