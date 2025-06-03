
# ⚠️ Set this to your GitHub repo
$repo = "sgshaji/InterviewPrepTracker"

# ⚠️ Set path to your CSV file
$csvPath = "D:\Projects\InterviewPrepTracker\github-issues-upload.csv"

# Import CSV
$issues = Import-Csv -Path $csvPath

foreach ($issue in $issues) {
    $title = $issue.Title
    $body = $issue.Body
    $labels = $issue.Labels -replace ",", " --label "

    Write-Host "Creating issue: $title"

    gh issue create `
        --repo $repo `
        --title "$title" `
        --body "$body" `
        --label $labels
}
