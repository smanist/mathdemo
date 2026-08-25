# Convert MyST figure fences before Pandoc parses the Markdown. The CommonMark
# reader otherwise discards the image path from a line such as:
#
#   ```{figure} ../pics/example.png

function trim(value) {
  sub(/^[[:space:]]+/, "", value)
  sub(/[[:space:]]+$/, "", value)
  return value
}

function scale_width(value, number, suffix) {
  value = trim(value)

  if (value !~ /^[0-9]+([.][0-9]*)?[^0-9]*$/) {
    printf "warning: cannot scale non-numeric figure width: %s\n", value > "/dev/stderr"
    return value
  }

  number = value
  sub(/[^0-9.].*$/, "", number)
  suffix = substr(value, length(number) + 1)

  return sprintf("%.10g%s", number * width_scale, suffix)
}

function emit_figure(alt, attributes) {
  alt = figure_caption
  if (alt == "") {
    alt = figure_alt
  }

  # Keep a closing bracket from terminating Pandoc's image description.
  gsub(/]/, "\\]", alt)

  attributes = ""
  if (figure_name != "") {
    attributes = attributes " #" figure_name
  }
  if (figure_width != "") {
    attributes = attributes " width=\"" figure_width "\""
  }

  printf "![%s](<%s>)", alt, figure_path
  if (attributes != "") {
    printf "{%s}", substr(attributes, 2)
  }
  printf "\n\n"
}

BEGIN {
  if (width_scale == "") {
    width_scale = 1
  }
  in_figure = 0
}

index($0, "```{figure}") == 1 {
  if (in_figure) {
    print "error: nested MyST figure directive" > "/dev/stderr"
    exit 1
  }

  in_figure = 1
  figure_path = substr($0, length("```{figure}") + 1)
  figure_path = trim(figure_path)
  figure_name = ""
  figure_width = ""
  figure_alt = ""
  figure_caption = ""

  if (figure_path == "") {
    print "error: MyST figure directive is missing an image path" > "/dev/stderr"
    exit 1
  }
  next
}

in_figure && /^[[:space:]]*```[[:space:]]*$/ {
  emit_figure()
  in_figure = 0
  next
}

in_figure {
  if ($0 ~ /^:name:[[:space:]]*/) {
    option = $0
    sub(/^:name:[[:space:]]*/, "", option)
    figure_name = trim(option)
  } else if ($0 ~ /^:width:[[:space:]]*/) {
    option = $0
    sub(/^:width:[[:space:]]*/, "", option)
    figure_width = scale_width(option)
  } else if ($0 ~ /^:alt:[[:space:]]*/) {
    option = $0
    sub(/^:alt:[[:space:]]*/, "", option)
    figure_alt = trim(option)
  } else if ($0 ~ /^:[[:alnum:]_-]+:/) {
    # Other MyST figure options, including :align:, do not need a Pandoc
    # equivalent: LaTeX figures are centered by default.
  } else if ($0 !~ /^[[:space:]]*$/) {
    if (figure_caption != "") {
      figure_caption = figure_caption " "
    }
    figure_caption = figure_caption trim($0)
  }
  next
}

{
  print
}

END {
  if (in_figure) {
    print "error: unterminated MyST figure directive" > "/dev/stderr"
    exit 1
  }
}
