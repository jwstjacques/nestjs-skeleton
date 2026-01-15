#!/bin/bash

# Follow logs for all services
if [ -z "$1" ]; then
    docker-compose logs -f
else
    # Follow logs for specific service
    docker-compose logs -f $1
fi
