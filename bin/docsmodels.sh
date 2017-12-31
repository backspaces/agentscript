files=`ls models/*.js` # list of models/foo.js names
# echo $files
for file in $files; do # file = "models/foo.js"
  echo '=====' $file
  imports=` grep '^import' $file | sed 's:^import *::;s: .*::' `
  imports=` echo $imports | sed "
    s: :, :g
    s:^:import {:
    s:$:} from '../dist/AS.module.js':
  " `
  echo $imports
  cat $file | sed "
    1i\\
  $imports
    /^import.*\/src/d
  " > docs/$file
done

cp models/index.html docs/models
