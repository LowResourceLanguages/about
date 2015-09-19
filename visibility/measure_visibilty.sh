#!/bin/bash
#
# Measure the visibility of 
#
#
#
cd $LOW_RESOURCE_LANGUAGES_ABOUT_HOME
GITHUB_API="https://api.github.com/repos"
LRL_GITHUB_REPOSITORIES=`cat data/lrl_repositories_github.txt`

echo "$LRL_GITHUB_REPOSITORIES";

for repo in $LRL_GITHUB_REPOSITORIES; do
  echo "curl $GITHUB_API/$repo";
  json=`curl $GITHUB_API/$repo?access_token=$GITHUB_API_TOKEN`;
  echo "$repo"
  echo  " $json" | grep "stargazers_count" ;
  echo  " $json" | grep "watchers_count" ;
  echo  " $json" | grep "forks_count" ;
  echo  " $json" | grep "subscribers_count" ;
  echo  " $json" | grep "open_issues_count" ;
  echo "$json" > "visibility/results/${repo/\//___}.json"
done

#ls -al visibility/results
echo `date` >> visibility/results/run.log
git add visibility/results
git commit -m "measures for `date`"

