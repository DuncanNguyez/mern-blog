#!/bin/bash

# Đường dẫn đến thư mục chứa các file cần đổi tên
directory="./src"

for file in $directory/*.jsx; do    ren
    if [ -f "$file" ]; then
        new_name=$(echo "$file" | sed 's/\.jsx$/\.tsx/')
        mv "$file" "$new_name"
        echo "Đã đổi tên $file thành $new_name"
    fi
done

echo "Đã hoàn thành đổi tên các file từ .jsx sang .tsx."