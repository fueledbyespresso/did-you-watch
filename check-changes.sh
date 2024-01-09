#!/bin/bash
changes=$(git diff HEAD^ HEAD -- . ':!frontend'; echo $?)
echo $changes
if [[ “$changes” -ne 0 ]]; then exit 1
