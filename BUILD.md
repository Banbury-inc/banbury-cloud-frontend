xcrun notarytool store-credentials


xcrun notarytool submit "Banbury Cloud-3.0.0-arm64.dmg" --keychain-profile "Michael Mills"

xcrun stapler staple "Banbury Cloud-3.0.0-arm64.dmg"


