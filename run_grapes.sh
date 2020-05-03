#!/bin/sh  
while true  
do  
  curl -X POST http://localhost:3000/item/update/vivino/grapes
  sleep 50  
done
