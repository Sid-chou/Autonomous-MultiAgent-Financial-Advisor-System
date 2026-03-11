import unittest
from unittest.mock import patch

from app import app
from data_fetcher import UpstreamTemporaryError


class AppTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    @patch("app.fetch_metrics")
    def test_analyze_fundamental_returns_null_payload_for_upstream_errors(self, mock_fetch):
        mock_fetch.side_effect = UpstreamTemporaryError(
            "Yahoo Finance temporarily rejected the request for INFY.NS. Retry shortly."
        )

        response = self.client.post(
            "/api/v1/analyze-fundamental",
            json={"ticker": "INFY.NS"},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "NULL")
        self.assertIn("Yahoo Finance temporarily rejected the request", payload["error"])


if __name__ == "__main__":
    unittest.main()
