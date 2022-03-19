import os
import sys
path=sys.argv[0]
print(os.system("git add " + path))
print(os.system('git commit -m "Create CS: ' + os.path.basename(path) + '"'))