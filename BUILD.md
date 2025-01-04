xcrun notarytool store-credentials


xcrun notarytool submit "Banbury Cloud-3.0.0-arm64.dmg" --keychain-profile "Michael Mills"

xcrun notarytool wait 99523510-b6d6-47e8-9c7d-da767bad0e16 --keychain-profile "Michael Mills"


xcrun stapler staple "Banbury Cloud-3.0.0-arm64.dmg"


