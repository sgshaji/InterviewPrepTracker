
# Set your repo
$repo = "sgshaji/InterviewPrepTracker"
$csvPath = "D:\Projects\InterviewPrepTracker\github-issues-upload.csv"

# Import issues from CSV
$issues = Import-Csv -Path $csvPath

foreach ($issue in $issues) {
    $title = $issue.Title
    $body = $issue.Body
    $labelsRaw = $issue.Labels -split ","

    # Safely build label args
    $labelArgs = ""
    foreach ($label in $labelsRaw) {
        if ($label.Trim() -ne "") {
            $labelArgs += "--label `"$label`" "
        }
    }

    Write-Host "`n--- Creating issue: $title ---"
    gh issue create `
        --repo $repo `
        --title "$title" `
        --body "$body" `
        $labelArgs
}
