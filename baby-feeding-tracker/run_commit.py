import subprocess
import os

os.chdir(r"D:\trae_projects\Knowledge Base\baby-feeding-tracker")

# 设置git用户
subprocess.run(["git", "config", "user.email", "dev@example.com"], shell=True)
subprocess.run(["git", "config", "user.name", "Developer"], shell=True)

# 提交
result = subprocess.run(['git', 'commit', '-m', 'feat: add x-icon SVG component'], 
                       capture_output=True, text=True, shell=True)
print(result.stdout)
print(result.stderr)
