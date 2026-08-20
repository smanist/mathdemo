-- Normalize the small subset of MyST used by the chapter PDFs.

function CodeBlock(block)
  if block.classes[1] ~= "{math}" then
    return nil
  end

  local body = block.text
  local label

  body = body:gsub("^:label:%s*([^\n]+)\n+", function(value)
    label = value:gsub("%s+$", "")
    return ""
  end, 1)

  if label then
    return pandoc.RawBlock(
      "latex",
      "\\begin{equation}\n" .. body .. "\n\\label{" .. label .. "}\n\\end{equation}"
    )
  end

  return pandoc.Para({pandoc.Math("DisplayMath", body)})
end

function Para(para)
  local text = pandoc.utils.stringify(para)

  if text:match("^:::+%{container%}") and text:match("course%-interactive") then
    return {}
  end

  return nil
end

function Inlines(inlines)
  local result = {}
  local index = 1

  while index <= #inlines do
    local current = inlines[index]
    local following = inlines[index + 1]
    local role

    if current.t == "Str" then
      role = current.text:match("^%{([%w_-]+)%}$")
    end

    if current.t == "Str" and current.text == "♣" then
      table.insert(result, pandoc.Math("InlineMath", "\\clubsuit"))
      index = index + 1
    elseif role and following and following.t == "Code" then
      local target = following.text

      if role == "eq" then
        table.insert(result, pandoc.RawInline("latex", "\\eqref{" .. target .. "}"))
        index = index + 2
      elseif role == "numref" or role == "ref" then
        table.insert(result, pandoc.RawInline("latex", "\\ref{" .. target .. "}"))
        index = index + 2
      elseif role == "doc" then
        table.insert(result, pandoc.Str(target:gsub("_", " ")))
        index = index + 2
      else
        table.insert(result, current)
        index = index + 1
      end
    else
      table.insert(result, current)
      index = index + 1
    end
  end

  return result
end

function Pandoc(document)
  local result = {}
  local skipped_heading_level

  for _, block in ipairs(document.blocks) do
    if skipped_heading_level and block.t == "Header" and block.level <= skipped_heading_level then
      skipped_heading_level = nil
    end

    if not skipped_heading_level and block.t == "Header" then
      local heading = pandoc.utils.stringify(block.content):lower()

      if heading:match("interactiv") or heading:match("interaction") then
        skipped_heading_level = block.level
      end
    end

    if not skipped_heading_level then
      table.insert(result, block)
    end
  end

  document.blocks = result
  return document
end
