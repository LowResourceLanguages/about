#!/bin/bash
#
# Measure the visibility of 
#
#
#
#
GITHUB_API="https://api.github.com/repos"
LRL_GITHUB_REPOSITORIES="fielddb/fielddb RichardLitt/endangered-languages"



for repo in $LRL_GITHUB_REPOSITORIES; do
  echo "curl $GITHUB_API/$repo";
  json=`curl $GITHUB_API/$repo`;
  echo "$repo"
  echo  " $json" | grep "stargazers_count" ;
  echo  " $json" | grep "watchers_count" ;
  echo  " $json" | grep "forks_count" ;
  echo  " $json" | grep "subscribers_count" ;
  echo  " $json" | grep "open_issues_count" ;
  echo "$json" > "results/${repo/\//___}.json"
done

ls -al results