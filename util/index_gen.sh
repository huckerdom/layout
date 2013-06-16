#!/bin/bash
# Generates the index.html from the README.md
## Run this script from the top level of the repository
pandoc --title-prefix=Layout -H util/scripts.html -B util/nav_bar.html -A util/footer.html --css static/css/style.css -o index.html -t html5 README.md
