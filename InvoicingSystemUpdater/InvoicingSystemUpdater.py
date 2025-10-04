import json
import subprocess
import datetime
import os
import zipfile
import threading
import sys
import tkinter as tk
from tkinter import ttk, messagebox
from tkinter.scrolledtext import ScrolledText

def resource_path(relative_path):
    """
    Get absolute path to resource, works for development and PyInstaller
    """
    try:
        base_path = sys._MEIPASS  # PyInstaller temp directory
    except AttributeError:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

class UpdaterApp:
    def __init__(self, master):
        self.master = master
        master.title("🧾 Invoicing System Updater")
        master.geometry("800x600")
        master.configure(bg="#f5f5f5")

        style = ttk.Style(master)
        style.theme_use("clam")
        style.configure("TButton", font=("Segoe UI", 11), padding=10)
        style.configure("Header.TLabel", font=("Segoe UI", 16, "bold"), foreground="#333", background="#f5f5f5")
        style.configure("Status.TLabel", font=("Segoe UI", 10), foreground="#666", background="#f5f5f5")

        # ─── Load config.json ─────────────────────────────────────────────────────
        cfg_path = resource_path("config.json")
        try:
            with open(cfg_path, encoding='utf-8') as f:
                cfg = json.load(f)
        except Exception as e:
            messagebox.showerror("Configuration Error", f"Could not read config.json:\n{e}")
            sys.exit(1)

        # Required config keys
        self.REPO = cfg.get('repo_path', "").strip()
        if not self.REPO:
            messagebox.showerror("Configuration Error", "`repo_path` is missing or empty in config.json.")
            sys.exit(1)

        # If the path is not a directory, we cannot proceed
        if not os.path.isdir(self.REPO):
            # Log to console and pop up an error dialog
            err_msg = f"❌ ERROR: Repository path does not exist:\n  {self.REPO}"
            print(err_msg)
            messagebox.showerror("Repository Not Found", err_msg)
            # Create a dummy log file so the log method still has somewhere to write
            ts = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            self.LOG = os.path.join(os.path.dirname(cfg_path), f"update_{ts}.log")
            with open(self.LOG, 'a', encoding='utf-8') as f:
                f.write(f"[{ts}] {err_msg}\n")

            # Still set up the UI, but disable the “Run Update” button
            ttk.Label(master, text="Invoicing System Updater", style="Header.TLabel").pack(pady=(15, 5))
            self.status = ttk.Label(master, text="ERROR: Repo path not found.", style="Status.TLabel", anchor="w")
            self.status.pack(fill="x", padx=15, pady=(0, 10))
            self.button = ttk.Button(master, text="🔄 Run Update", command=self.on_update, state=tk.DISABLED)
            self.button.pack(pady=5)

            self.text = ScrolledText(master, state='normal', wrap='word', font=("Consolas", 10), bg="#ffffff")
            self.text.pack(expand=True, fill='both', padx=15, pady=(5, 10))
            # Show the error in the log area
            self.text.insert(tk.END, f"[{ts}] {err_msg}\n")
            self.text.configure(state='disabled')
            return  # Skip the rest of __init__, since we cannot continue without a valid repo

        # If we get here, repo_path does exist:
        self.BRANCH = cfg.get('branch', 'main')
        self.BACKUP = cfg.get('backup', True)
        self.BACKUP_DIR = cfg.get('backup_path', os.path.join(os.path.dirname(cfg_path), 'backups'))

        # Generate a unique log file per run
        ts = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        self.LOG = os.path.join(os.path.dirname(cfg_path), f'update_{ts}.log')

        # ─── UI Layout ─────────────────────────────────────────────────────────────
        ttk.Label(master, text="Invoicing System Updater", style="Header.TLabel").pack(pady=(15, 5))

        # Status bar
        self.status = ttk.Label(master, text="Ready", style="Status.TLabel", anchor="w")
        self.status.pack(fill="x", padx=15, pady=(0, 10))

        # Run Update button
        self.button = ttk.Button(master, text="🔄 Run Update", command=self.on_update)
        self.button.pack(pady=5)

        # Log window (scrolled text)
        self.text = ScrolledText(master, state='normal', wrap='word', font=("Consolas", 10), bg="#ffffff")
        self.text.pack(expand=True, fill='both', padx=15, pady=(5, 10))

        # Success message (hidden by default)
        self.success_label = tk.Label(master,
                                      text="✅ Update completed successfully!",
                                      font=("Segoe UI", 14, "bold"),
                                      bg="#d4edda", fg="#155724",
                                      pady=10)
        self.success_label.pack(fill="x", padx=15, pady=(0, 15))
        self.success_label.pack_forget()

        # ─── Locate docker-compose.yml ────────────────────────────────────────────
        compose_file = os.path.join(self.REPO, 'docker-compose.yml')
        if not os.path.isfile(compose_file):
            # If not found at root, search one level down
            for entry in os.listdir(self.REPO):
                candidate = os.path.join(self.REPO, entry)
                if os.path.isdir(candidate) and os.path.isfile(os.path.join(candidate, 'docker-compose.yml')):
                    self.REPO = candidate
                    self.log(f"docker-compose.yml found in subfolder: {candidate}")
                    break

        # ─── Figure out whether to use 'docker-compose' or 'docker compose' ──────
        self.compose_cmd = 'docker-compose'
        try:
            subprocess.run(f"{self.compose_cmd} version",
                           shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                           text=True, check=True)
        except Exception:
            self.compose_cmd = 'docker compose'

        self.log(f"Using compose command: {self.compose_cmd}")

        # ─── Keep track if Docker is available ───────────────────────────────────
        self.docker_available = False

    def log(self, msg):
        """
        Write `msg` to both the onscreen text widget and to a timestamped log file.
        """
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        line = f"[{timestamp}] {msg}\n"

        # Append to log file
        try:
            with open(self.LOG, 'a', encoding='utf-8') as f:
                f.write(line)
        except Exception as file_err:
            print(f"[Log Write Error] {file_err} (message was: {msg})")

        # Append to on-screen text widget
        if hasattr(self, 'text'):
            def append_to_text():
                self.text.configure(state='normal')
                self.text.insert(tk.END, line)
                self.text.see(tk.END)
                self.text.configure(state='disabled')
            self.text.after(0, append_to_text)

        # Update status bar
        if hasattr(self, 'status'):
            self.status.after(0, lambda: self.status.config(text=msg))

    def show_success(self):
        self.success_label.after(0, lambda: self.success_label.pack(fill="x", padx=15, pady=(0, 15)))

    def hide_success(self):
        self.success_label.after(0, self.success_label.pack_forget)

    def run(self, cmd, *, ignore_errors=False):
        """
        Run a shell command `cmd`. Log stdout/stderr line by line.
        If return code != 0 and ignore_errors is False, raise RuntimeError.
        If ignore_errors is True, log the non-zero return code but do NOT raise.
        """
        self.log(f"> {cmd}")
        proc = subprocess.Popen(cmd,
                                shell=True,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                                text=True)
        out, err = proc.communicate()

        # Log stdout and stderr line by line
        for output in (out, err):
            if output:
                for line in output.strip().splitlines():
                    self.log(line)

        self.log(f"Return code: {proc.returncode}")
        if proc.returncode != 0 and not ignore_errors:
            raise RuntimeError(f"Command failed (exit {proc.returncode})")

    def backup_repo(self):
        """
        Zip up the current repo folder (excluding .git) into BACKUP_DIR with a timestamp.
        """
        if not os.path.isdir(self.BACKUP_DIR):
            os.makedirs(self.BACKUP_DIR)

        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_name = os.path.join(self.BACKUP_DIR, f"backup_{ts}.zip")
        self.log(f"Creating backup at {zip_name}")

        with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zf:
            root_folder = os.path.dirname(self.REPO)
            for root, _, files in os.walk(root_folder):
                # Skip any .git folder entirely
                if '.git' in root.split(os.path.sep):
                    continue
                for fn in files:
                    path = os.path.join(root, fn)
                    rel = os.path.relpath(path, root_folder)
                    zf.write(path, rel)

    def git_is_dirty(self):
        """
        Return True if `git status --porcelain` is non-empty, else False.
        """
        try:
            result = subprocess.run(
                f'cd "{self.REPO}" && git status --porcelain',
                shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                text=True, check=True
            )
            return bool(result.stdout.strip())
        except Exception:
            # If git is not even a repo, consider it "not dirty"
            return False

    def git_stash(self):
        """
        Stash any local changes and return True if stash was created, else False.
        """
        try:
            self.log("Stashing local changes (if any).")
            proc = subprocess.Popen(
                f'cd "{self.REPO}" && git stash --include-untracked',
                shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
            )
            out, err = proc.communicate()
            combined = out + "\n" + err
            for line in combined.splitlines():
                if line.strip():
                    self.log(line)
            if "No local changes to save" in combined:
                self.log("No changes to stash.")
                return False
            self.log("Changes stashed.")
            return True
        except Exception as e:
            self.log(f"Failed to stash changes: {e}")
            return False

    def git_stash_pop(self):
        """
        Pop the most recent stash, if any. If stash is empty or fails, log it.
        """
        try:
            self.log("Restoring stashed changes (if any).")
            proc = subprocess.Popen(
                f'cd "{self.REPO}" && git stash pop',
                shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
            )
            out, err = proc.communicate()
            combined = out + "\n" + err
            for line in combined.splitlines():
                if line.strip():
                    self.log(line)
            if proc.returncode != 0:
                self.log("Warning: `git stash pop` returned non-zero. You may need to manually restore changes.")
        except Exception as e:
            self.log(f"Error popping stash: {e}")

    def run_update(self):
        """
        This method performs the full update:
          1. Backup (zip)
          2. Git stash (if needed), fetch, reset
          3. Docker steps (down, pull, build, up) if Docker is available
        """
        try:
            self.hide_success()
            self.log("=== Starting update ===")

            # ─── Step 1: Backup repository (if configured) ────────────────────────
            if self.BACKUP:
                try:
                    self.backup_repo()
                except Exception as e:
                    self.log(f"Warning: Backup failed: {e}")

            # ─── Step 2: Git operations ───────────────────────────────────────────
            if os.path.isdir(os.path.join(self.REPO, ".git")):
                # If there are uncommitted changes, stash them
                stashed = False
                if self.git_is_dirty():
                    stashed = self.git_stash()

                # Fetch & hard-reset
                try:
                    self.run(f'cd "{self.REPO}" && git fetch --all --prune')
                    self.run(f'cd "{self.REPO}" && git reset --hard origin/{self.BRANCH}')
                except Exception as e:
                    self.log(f"❌ ERROR (git fetch/reset): {e}")
                finally:
                    # If we stashed, pop now
                    if stashed:
                        self.git_stash_pop()
            else:
                self.log("❌ Warning: Repo is not a Git repository (no .git folder). Skipping Git operations.")

            # ─── Step 3: Docker operations (if Docker is available) ───────────────
            if self.docker_available:
                # 3.1: docker-compose down (ignore errors if project doesn't exist yet)
                try:
                    self.run(f'cd "{self.REPO}" && {self.compose_cmd} down', ignore_errors=True)
                except Exception as e:
                    # Should never actually raise here because ignore_errors=True, but just in case:
                    self.log(f"Warning: `docker-compose down` failed: {e}")

                # 3.2: docker-compose pull --ignore-pull-failures (ignore errors but log them)
                try:
                    self.run(f'cd "{self.REPO}" && {self.compose_cmd} pull --ignore-pull-failures', ignore_errors=True)
                except Exception as e:
                    self.log(f"Warning: `docker-compose pull` failed: {e}")

                # 3.3: docker-compose build
                try:
                    self.run(f'cd "{self.REPO}" && {self.compose_cmd} build', ignore_errors=False)
                except Exception as e:
                    self.log(f"❌ ERROR: `docker-compose build` failed: {e}")

                # 3.4: docker-compose up -d
                try:
                    self.run(f'cd "{self.REPO}" && {self.compose_cmd} up -d', ignore_errors=False)
                except Exception as e:
                    self.log(f"❌ ERROR: `docker-compose up` failed: {e}")

                self.log("✅ Docker steps completed (see above for any warnings/errors).")
            else:
                self.log("⚠️ Docker not available or not running. Skipping all Docker steps.")

            # ─── Completed ─────────────────────────────────────────────────────────
            self.log("✅ Update process finished. (Check above for any warnings or errors.)")
            self.show_success()

        except Exception as e:
            self.log(f"❌ ERROR: Unexpected failure: {e}")
        finally:
            # Re-enable the button in the GUI
            self.button.after(0, lambda: self.button.config(state=tk.NORMAL))

    def on_update(self):
        """
        Called when the user clicks “Run Update.” First check Docker availability.
        If Docker is not running, set a flag but do not abort—we will skip the Docker steps.
        """
        self.log("Checking Docker availability...")
        try:
            subprocess.run('docker version',
                           shell=True, stdout=subprocess.PIPE,
                           stderr=subprocess.PIPE, text=True, check=True)
            self.docker_available = True
            self.log("Docker appears to be running.")
        except Exception:
            self.docker_available = False
            self.log("⚠️ Docker does not appear to be running. Docker steps will be skipped.")

        # Disable button so user cannot click again until current run finishes
        self.button.config(state=tk.DISABLED)
        # Run the update process on a background thread (so the UI doesn’t freeze)
        threading.Thread(target=self.run_update, daemon=True).start()

if __name__ == '__main__':
    root = tk.Tk()
    app = UpdaterApp(root)
    root.mainloop()
