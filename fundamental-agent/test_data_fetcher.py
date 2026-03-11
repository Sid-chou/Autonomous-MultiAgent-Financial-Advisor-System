import json
import unittest
from unittest.mock import MagicMock, patch

from data_fetcher import UpstreamTemporaryError, _fetch_info_with_retry, fetch_metrics


class InfoTicker:
    def __init__(self, payload=None, error=None):
        self._payload = payload
        self._error = error

    @property
    def info(self):
        if self._error is not None:
            raise self._error
        return self._payload


class DataFetcherTests(unittest.TestCase):
    @patch("data_fetcher._fetch_info_with_retry")
    def test_fetch_metrics_maps_expected_fields(self, mock_fetch):
        mock_fetch.return_value = {
            "trailingPE": 24.1,
            "revenueGrowth": 0.12,
            "profitMargins": 0.18,
            "debtToEquity": 35.0,
            "earningsGrowth": 0.09,
            "returnOnEquity": 0.27,
            "currentPrice": 1678.4,
            "sector": "Technology",
            "industry": "IT Services",
        }

        metrics = fetch_metrics("INFY.NS")

        self.assertEqual(metrics["pe_ratio"], 24.1)
        self.assertEqual(metrics["profit_margins"], 0.18)
        self.assertEqual(metrics["industry"], "IT Services")

    @patch("data_fetcher.time.sleep")
    @patch("data_fetcher.YfData")
    @patch("data_fetcher.yf.Ticker")
    def test_fetch_info_with_retry_raises_controlled_error_after_retryable_failures(
        self, mock_ticker, mock_yf_data, mock_sleep
    ):
        mock_session = MagicMock()
        mock_session.cookies.clear = MagicMock()
        mock_yf_data.return_value = MagicMock(_session=mock_session, _crumb=None, _cookie=None)

        decode_error = json.JSONDecodeError("Expecting value", "", 0)
        mock_ticker.side_effect = [InfoTicker(error=decode_error) for _ in range(3)]

        with self.assertRaises(UpstreamTemporaryError) as ctx:
            _fetch_info_with_retry("INFY.NS", attempts=3, backoff_seconds=0)

        self.assertIn("Yahoo Finance temporarily rejected the request", str(ctx.exception))
        self.assertEqual(mock_ticker.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2)


if __name__ == "__main__":
    unittest.main()
