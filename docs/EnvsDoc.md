Environment Variables Needed Structure:
Need to be able to run the code in three situations:
1 - Run on personal computer
2 - Run on balena device local functionality
3 - Run on balena production functionality

These three situations require different specifications:
1 - Run on personal computer
The environment variables need to be read in as configuration variables from a javascript module, no variables will come from the balena service.

2 - Run on balena device local functionality
Some environment variables will come automatically (BALENA, LOCAL_MODE) but many won't.  As such they will need to be read in as configuration variables from a javascript module.

3 - Run on balena production functionality
All non-security environment variables will come automatically from the Balena service, and as such won't need to be read in as configuration variables from a javascript module.



