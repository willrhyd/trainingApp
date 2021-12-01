Fitness activity tracking web app. You can upload manual rides or upload a .fit cycling file (with a power data). You can also plan future rides which will sync to an uploaded file and rate based on % of the activity complete (red, amber or green). 

This is still in development and I plant o gradually add more functionality/refine.

The power processing relies on calculations from "Training and Racing with a Power Meter", Hunter Allen and Andy Coggan, and the idea is generally to try and emulate TrainingPeaks.com.

Current known issues: 
-Won't tke account of multiple activities on a single day on the dashboard 
-When first logging in, you need to refresh to get the navbar to display properly 
-The more detailed ride information is quite sparse at the moment, and also a little glitchy to display (have to click a few times before it displays).

Planned additions: 
-Activity analysis - Would like to add some better file analysis: display route on map, graph elevation, lap analysis, and ability to compare completed vs planned activity 
-Weekly summaries - Would like to add a summary box for each week to summarise distance, time, tss etc. -Some kind of automatic sync function, this may have to be a web scraper to get .fit files from Strava or Garmin Connect
