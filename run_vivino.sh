#!/bin/sh  
while true  
do  
  curl -X POST http://localhost:1337/item/update/vivino
  sleep 300  
done
