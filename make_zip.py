import os
import zipfile

def create_zip():
    zip_filename = 'project_source.zip'
    ignore_dirs = {'node_modules', 'dist', '.git', '.cache', '.upm'}
    ignore_files = {'project_source.zip'}

    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if file in ignore_files:
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)
    print("Zip created")

if __name__ == '__main__':
    create_zip()
