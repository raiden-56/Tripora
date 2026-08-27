"""Validation helpers for user-supplied Google Drive folder links.

We only store and validate the URL — there is no OAuth flow or Drive API call
here. A real integration (listing files, syncing metadata) would live in this
package behind the same validate_drive_url() call site.
"""

import re

_DRIVE_URL_PATTERN = re.compile(r"^https://drive\.google\.com/(drive|folderview|open)")


def is_valid_drive_url(url: str) -> bool:
    return bool(_DRIVE_URL_PATTERN.match(url.strip()))
