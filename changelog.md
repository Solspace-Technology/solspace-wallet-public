# Tester Notes

---
## Version XXX Build X

### Features
## FEATURE
- 
  
### Known Issues
- 

### Next Up
- 
---
## Version 1.1.0 Build 1

### Features
## dApp Browser
- You can now browse to any website and make transactions using any of your attached wallets, including your Ledger!

## Landscape Support
- Landscape is now supported to enable better interactions using and iOS device. This is to enable easier usage on iPads and macOS devices.
  
### Known Issues
- Scroll views might act a little weird on the wallet pages. Please submit bug reports for any weirs things you see here.
- Swaps may not be working. This might be removed for the public release. Submit feedback if you're against this decision!

### Next Up
- Bug fixes before the public release!
---
## Version 1.0.1 Build 1

### Features
- Added support for Solana Pay QR codes and public key QR  codes
- Export mnemonic text is copied on touch from the 'export mnemonic' screen

### Changes
- Updated app icon and splash screen
  
### Known Issues
- Export mnemonic screen might not always show the text as copied when clicked, but it is.


---
## Version 1.0.1 Build 8 *Hotfix*

### Features
## Layout Animations
- Added layout animations to initial token loading screens and send tokens screen (Thanks Alex!!!)
  
### Bug Fixes
## Portfolio Balance
- Fixed portfolio balance to never spill over to more than one line

### Next Up
- Add the ability to view and create staking accounts
- Validator stats page maybe?
---
## Version 1.0.1 Build 7

### Features
## In-app transaction WebView
- When you click on a transaction toast solana explorer now opens in app instead of linking to safari

## Wallet Home Screen Update
- Wallet name is now in the header
- Simplified the layout of data on the main wallet view

## View/Send Token Screen Update
- The view and send token screens are updated to better match the design of the rest of the application
  
### Bug Fixes
## Wallet Selection
- Selecting a wallet that was already active used to clear token state
- App would initially load default settings after loading other data
- Airdrops now wait for confirmation before firing success

### Next Up
- Add the ability to view and create staking accounts
- Validator stats page maybe?

---
## Version 1.0.1 Build 6

### Changes
## Added Solana Name Service
- Users can now send SOL and SPL tokens using registered Twitter handles or .sol TLD names

---
## Version 1.0.1 Build 5

### Changes
- Big changes to navigation
  - Wallets now live in an ever present drawer component
  - View and swap token screens now take up the whole screen, and pop in

- Lots of small style changes, mostly simplifying UI and making it more consistent

### Known Issues
- Opacity looks strange when selecting a wallet from the drawer menu

### Next Up
- Adding built in web view in order to view Token info on Solscan & view transactions in app
- Adding SOL DNS lookup to send tokens to a .sol address or twitter handle

---
## Version 1.0.1 Build 4

### Changes
- Added import mnemonic phrase option. 
  - Importing a mnemonic will overwrite the existing phrase on device, but keep any keypairs derived from it usable. Please test!

- Added network options to swap
  - While Jupiter Aggregator doesn't play well with anything other than mainnet-beta, you can now check for routes on devnet and testnet.
  
- Bug with network switching and main token list
  - I noticed a weird bug where my token list wouldn't load after I switched from devnet back to mainnet-beta, but I was unable to reproduce. Please report if you notice this as well.

### Bug Fixes
- Wallet list items padding adjusted
- Keypairs now generated asynchronously - not as much of a speed bump as I would have thought though...
- All views are now rendered in a SafeAreaView to help the display on different device sizes
  
### Known Issues
- View Tokens & Send Tokens screens do not respond to swipe gestures. 
- NFT/Token headings are not clickable and do not reset on wallet changes
- Importing a wallet and not making any other wallet based change will not save the new data on device