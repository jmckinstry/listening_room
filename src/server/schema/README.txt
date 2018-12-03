This folder contains server schema updates as part of an automatic updating scheme.

Any file may be inserted into this folder, and each will fall under one of two cases:
-	File does not match pattern /[0-9]+\.sql/:
-		Any file here is for humans to read.
-	File matches pattern /[0-9]+\.sql/:
-		These files represent updates to database.sqlite, and will be executed in numerical order starting at the lowest non-executed version.
-		Each file that executes successfully will increase the stored database version to the number on the file.
-		All updates are atomic: If they fail the node instance will stop with an error and no changes will be made to the database.