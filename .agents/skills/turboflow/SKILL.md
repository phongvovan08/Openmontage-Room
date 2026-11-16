---
name: turboflow
description: "Automate batch image and video generation on Google Flow (Omni Flash, Veo 3.1 Fast/Lite/Quality, Nano Banana Pro/2.1/Lite) by controlling the TurboFlow Chrome extension over Chrome DevTools Protocol (port 9222). Use whenever the user mentions TurboFlow, Chrome Debug batch generation, Google Flow automation, Omni Flash 10s video batches, or Nano Banana batch images."
---

# TurboFlow Chrome Debug Automation Skill (`turboflow`)

This skill enables full end-to-end batch generation of **AI Videos** (`🌟 Omni Flash ✨ NEW`, `⚡ Veo 3.1 — Fast`, `🎬 Veo 3.1 — Lite`, `💎 Veo 3.1 — Quality`) and **AI Images** (`🍌 Nano Banana Pro`, `🍌 Nano Banana 2.1`, `🍌 Nano Banana 2 Lite`) on **Google Flow (`https://flow.google.com`)** by driving the user's installed **TurboFlow (`v2.4.0 PRO`)** Chrome Extension via **Chrome DevTools Protocol (CDP `port 9222`)**.

---

## 1. Quick-Start CLI (`scripts/turboflow_cli.py`)

A ready-to-run Python CLI is bundled at [`.agents/skills/turboflow/scripts/turboflow_cli.py`](./scripts/turboflow_cli.py).

### Check Status & Connect to Google Flow
```powershell
python -X utf8 .agents/skills/turboflow/scripts/turboflow_cli.py --status
```
*(Automatically launches Chrome Debug on port `9222` if not open, opens/activates a Google Flow project tab so TurboFlow switches from `Connecting...` to `Connected`, and prints current state.)*

### Run a Batch of `Omni Flash` 10-Second Videos (`9:16` Vertical)
```powershell
python -X utf8 .agents/skills/turboflow/scripts/turboflow_cli.py `
  --mode video `
  --model omni_flash `
  --ratio 9:16 `
  --duration 10 `
  --res 720p `
  --count 1 `
  --folder my-video-batch `
  --prompts-file path/to/prompts.md `
  --out-dir path/to/output_clips `
  --wait
```

### Run a Batch of `Nano Banana Pro` Images (`9:16` Vertical)
```powershell
python -X utf8 .agents/skills/turboflow/scripts/turboflow_cli.py `
  --mode image `
  --image-model pro `
  --ratio 9:16 `
  --count 1 `
  --folder my-image-batch `
  --prompts-file path/to/prompts.txt `
  --out-dir path/to/output_images `
  --wait
```

---

## 2. Architecture & Connection Rules

1. **Chrome Debug Profile & Port (`9222`):**
   - Executable: `"C:\Program Files\Google\Chrome\Application\chrome.exe"`
   - Arguments: `--remote-debugging-port=9222 --user-data-dir="C:\Users\ACER\chrome-debug"`
   - **⚠️ Agent KHÔNG THỂ tự mở Chrome Debug** (sandbox chặn hiện cửa sổ). Luôn nhờ user mở bằng **Win+R**: `"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\ACER\chrome-debug" --start-maximized https://flow.google.com/`
   - PowerShell alias on user's machine: `cdbg`
   - CDP Target List Endpoint: `http://127.0.0.1:9222/json/list`
2. **TurboFlow Extension Sidepanel Target:**
   - Extension ID: `bnfjjfgjpdagdiiiifdkjbjnadgdjaoe`
   - Sidepanel URL: `chrome-extension://bnfjjfgjpdagdiiiifdkjbjnadgdjaoe/sidepanel.html`
3. **Why TurboFlow Says `Connecting...` vs `Connected`:**
   - TurboFlow only switches to **`Connected`** when the active tab in its Chrome window is inside an **open Google Flow project editor** (`https://flow.google.com/project/<uuid>`).
   - If the Google Flow tab is sitting on the landing page (`https://flow.google.com/?pli=1`), click the **`Dự án mới` / `New project`** button (`button` containing text `Dự án mới` or `New project`) via CDP first and wait ~4 seconds for the URL to change to `/project/<uuid>`.

---

## 3. Complete DOM & Selector Contract (`TurboFlow v2.4.0`)

### A. Top Navigation Tabs
- Control tab: `button.tab[data-tab="control"]`
- Queue / Batches tab: `button.tab[data-tab="queue"]`
- Gallery tab: `button.tab[data-tab="gallery"]`
- Library tab: `button.tab[data-tab="library"]`
- Logs tab: `button.tab[data-tab="logs"]`

### B. Generation Mode & Speed
- **Mode**:
  - Image mode: `button.pill-btn[data-mode="image"]`
  - Video mode: `button.pill-btn[data-mode="video"]`
- **Speed**:
  - `button.pill-btn[data-speed="fast" | "balanced" | "slow" | "custom"]`
  - Custom delay seconds: `input#custom-delay-input`

### C. Video Mode Controls (`data-mode="video"`)
- **Video Model (`select#setting-video-quality`)**:
  - `"omni_flash"` — `🌟 Omni Flash ✨ NEW` *(Required for `10s` duration clips and `kaomei/stickman-video-director` Mode A!)*
  - `"lite"` — `🎬 Veo 3.1 — Lite`
  - `"fast"` — `⚡ Veo 3.1 — Fast`
  - `"quality"` — `💎 Veo 3.1 — Quality`
  - *Important*: After setting `sel.value = 'omni_flash'`, always dispatch `new Event('change', { bubbles: true })` so `button[data-vid-duration="10"]` unlocks!
- **Video Aspect Ratio (`button.pill-btn[data-vid-ratio]`)**:
  - `"landscape"` (`16:9`)
  - `"portrait"` (`9:16`)
- **Videos Per Prompt (`button.pill-btn[data-vid-count]`)**:
  - `"1"`, `"2"`, `"3"`, `"4"`
- **Video Resolution (`button.pill-btn[data-vid-res]`)**:
  - `"720p"`, `"360p"`
- **Video Duration (`button.pill-btn[data-vid-duration]`)**:
  - `"4"` (`4s`), `"6"` (`6s`), `"8"` (`8s`), `"10"` (`10s`, `#vid-duration-10`)
- **Video Input Sub-Mode (`button.pill-btn[data-vid-mode]`)**:
  - `"text"` — Text-to-Video (`edit_note Text`)
  - `"start_frame"` — Image-to-Video Start Frame (`#vid-mode-start`, upload via `#btn-upload-start` or `#btn-open-mapper-video`)
  - `"start_end_frame"` — Start + End Frame (`#vid-mode-se`)
  - `"reference"` — Reference Image (`#vid-mode-ref`)

### D. Image Mode Controls (`data-mode="image"`)
- **Image Model (`select#setting-image-model`)**:
  - Options matched by text/value: `🍌 Nano Banana Pro`, `🍌 Nano Banana 2.1`, `🍌 Nano Banana 2 Lite`
- **Image Aspect Ratio (`button.pill-btn[data-img-ratio]`)**:
  - `"IMAGE_ASPECT_RATIO_LANDSCAPE"` (`16:9`)
  - `"IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE"` (`4:3`)
  - `"IMAGE_ASPECT_RATIO_SQUARE"` (`1:1`)
  - `"IMAGE_ASPECT_RATIO_PORTRAIT_THREE_FOUR"` (`3:4`)
  - `"IMAGE_ASPECT_RATIO_PORTRAIT"` (`9:16`)
- **Images Per Prompt (`button.pill-btn[data-img-count]`)**:
  - `"1"`, `"2"`, `"3"`, `"4"`

### E. Prompts, Download Settings & Execution
- **Single Prompt Toggle (`input#single-prompt-toggle`)**:
  - For batch mode (multiple prompts), ensure `singleToggle.checked === false`.
- **Prompt Textarea (`textarea#prompt-input`)**:
  - When `single-prompt-toggle` is unchecked, TurboFlow splits `#prompt-input` by newline (`\n`).
  - **CRITICAL RULE**: Flatten each standalone prompt into a **single line** (replace internal newlines with spaces) before joining prompts with `\n`.
  - After setting `ta.value`, dispatch `new Event('input', { bubbles: true })` and `new Event('change', { bubbles: true })`, then verify `document.body.innerText` shows `<N> prompts`.
- **Save Folder (`input#setting-folder`)**:
  - Sets the subfolder inside `C:\Users\ACER\Downloads\<folder-name>\`.
  - **CRITICAL QUIRK**: TurboFlow automatically converts underscores (`_`) to hyphens (`-`) in the actual filesystem folder name (e.g., `stickman_mode_a` saves to `C:\Users\ACER\Downloads\stickman-mode-a\001.mp4`, `002.mp4`...).
- **Auto-Download Toggles**:
  - Images: `input#setting-autodownload-images` (`checked = true`)
  - Videos: `input#setting-autodownload-videos` (`checked = true`)
- **Start / Queue / Stop Buttons**:
  - Start immediately: `button#btn-start`
  - Add to queue: `button#btn-add-queue`
  - Stop generation: `button#btn-stop`

---

## 4. Reference Image Workflow (Character Consistency for Batch Video)

Use **Reference mode** (`data-vid-mode="reference"`) to keep a character visually consistent across multiple Veo 3 clips. This is critical for animation series (e.g., Bé Mochi Mầm Xanh).

### 4.1 Workflow Overview
```
┌─────────────┐    ┌───────────────────┐    ┌──────────────────┐    ┌────────────────┐
│ 1. Library   │ →  │ 2. Tag Images     │ →  │ 3. @tag Prompts  │ →  │ 4. Auto-Tag    │
│ Upload Refs  │    │ (+ Tag button)    │    │ (prepend @name)  │    │ Mapper → Start │
└─────────────┘    └───────────────────┘    └──────────────────┘    └────────────────┘
```

### 4.2 Step-by-Step

#### Step 1: Upload Reference Images to Library
```
Tab: Library → button#btn-library-upload
File input: #library-upload-input (accept: image/*)
```
- Upload character state images (e.g., 5 Mochi emotional states: peaceful, angry, overthinking, burnout, healing)
- Images appear in Library grid as `.library-item` elements
- Each item has `data-libId` attribute

#### Step 2: Tag Each Image
```
Each .library-item contains:
  - button.tag-add-btn ("+ Tag") → opens inline input
  - input.tag-input-field → type tag name, press Enter to confirm
  - .library-item-tag → displays the @tag after confirmation

Auto-tag shortcut: button#btn-library-autotag
  Title: "Auto-tag all untagged images using their filenames"
  → Sets @filename_without_extension as the tag
```
- **Manual:** Click `+ Tag` on each image → type short name (e.g., `mochi01`) → Enter
- **Automatic:** Click `Auto-tag` button → tags by filename (e.g., `01_binh_yen_to_mo.png` → `@01_binh_yen_to_mo`)

#### Step 3: Add @tags to Prompts
Prepend `@tagname` at the beginning of each prompt line:
```
@04_kiet_suc_tan_chay 16:9 widescreen composition. Mochi lies curled on a mattress...
@01_binh_yen_to_mo 16:9 widescreen composition. Mochi stands before a large clock...
@03_overthinking_may_ 16:9 widescreen composition. Mochi huddles beneath a blanket...
```
- **CRITICAL:** Each tagged prompt must be a **single line** (no internal newlines)
- The `@tag` must match exactly the tag name in Library

#### Step 4: Switch to Reference Mode & Auto-Tag Mapper
```
Control tab → Video mode → button[data-vid-mode="reference"]
Set prompts in textarea#prompt-input
Click button#btn-open-mapper-vidref ("Different for Each")
  → Opens #reference-mapper-modal
Click button#btn-mapper-autotag ("Auto-Tag")
  Title: "Match @tags in prompts to tagged library images"
  → Automatically maps each prompt's @tag to the matching library image
Enable checkbox#mapper-strip-tags
  Title: "Remove @tags from prompts after references are attached"
  → @tags are removed before sending to Veo 3
Click button#btn-mapper-save
```

### 4.3 Reference Mapper Modal DOM Contract
```
Modal: #reference-mapper-modal (.picker-modal)
  Status: #mapper-prompt-count → "30 prompts • 30 mapped"
  
  Action Buttons:
    #btn-mapper-1to1     → "Select images from PC → map 1:1 by order"
    #btn-mapper-all      → "Same references for every prompt"
    #btn-mapper-autotag  → "Match @tags in prompts to tagged library images"
    #btn-mapper-clear    → "Remove all mappings"
  
  Prompt Rows: .mapper-prompt-row
    .mapper-prompt-num   → "#001"
    .mapper-prompt-text  → prompt preview
    .mapper-prompt-refs  → reference image thumbnails (.mapper-refs-empty if none)
    Per-row buttons: edit, delete, add (add opens picker)
  
  Strip Tags: #mapper-strip-tags (checkbox)
  Save: #btn-mapper-save → "Save Mapping"
  Cancel: #btn-mapper-cancel
  Close: #btn-close-mapper
```

### 4.4 Reference Scope Options
| Mode | Button | Description |
|------|--------|-------------|
| **Same for All** | `#video-ref-scope-hint` visible | One set of ref images for all prompts |
| **Different for Each** | `#btn-open-mapper-vidref` | Open mapper to assign different refs per prompt |
| **Chain References** | `#chain-ref-toggle` | Each output becomes the reference for the next prompt (sequential, slow) |

### 4.5 CDP Automation Notes
- **Library upload via CDP:** `DOM.setFileInputFiles` on `#library-upload-input` works — dispatch `change` event after
- **Library auto-tag via CDP:** Click `#btn-library-autotag` — works reliably
- **Mapper auto-tag via CDP:** Click `#btn-mapper-autotag` after setting @tagged prompts — works reliably
- **Native file dialog (Auto 1:1):** `#btn-mapper-1to1` opens native OS file picker — **cannot be automated via CDP**, user must select files manually
- **Tag renaming via CDP:** Click `.tag-add-btn`, set `.tag-input-field` value, dispatch Enter keydown — **unreliable**, prefer auto-tag by filename

### 4.6 Recommended Naming Convention for Character Refs
```
<state_number>_<descriptive_name>.<ext>
01_binh_yen_to_mo.png       → @01_binh_yen_to_mo
02_nong_gian_boc_lua.png    → @02_nong_gian_boc_lua
03_overthinking_may_mua.png → @03_overthinking_may_mua
04_kiet_suc_tan_chay.png    → @04_kiet_suc_tan_chay
05_chua_lanh_no_hoa.png     → @05_chua_lanh_no_hoa
```
File names become tags automatically via Auto-tag → simplest workflow.

