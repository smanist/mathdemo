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

local function read_table_directive(block)
  if block.t ~= "Para" or not block.content[1] then
    return nil
  end

  if block.content[1].t ~= "Str" or block.content[1].text ~= ":::{table}" then
    return nil
  end

  local caption = {}
  local name
  local first_line = true
  local reading_name = false

  for index = 2, #block.content do
    local inline = block.content[index]

    if inline.t == "SoftBreak" or inline.t == "LineBreak" then
      first_line = false
      reading_name = false
    elseif first_line then
      table.insert(caption, inline)
    elseif inline.t == "Str" and inline.text == ":name:" then
      reading_name = true
    elseif reading_name and inline.t == "Str" then
      name = inline.text
      reading_name = false
    end
  end

  while caption[1] and caption[1].t == "Space" do
    table.remove(caption, 1)
  end
  while caption[#caption] and caption[#caption].t == "Space" do
    table.remove(caption)
  end

  return {caption = caption, name = name}
end

function Pandoc(document)
  local result = {}
  local pending_table
  local table_close_expected = false
  local skipped_heading_level

  for _, block in ipairs(document.blocks) do
    local keep = true

    if skipped_heading_level and block.t == "Header" and block.level <= skipped_heading_level then
      skipped_heading_level = nil
    end

    if not skipped_heading_level and block.t == "Header" then
      local heading = pandoc.utils.stringify(block.content):lower()

      if heading:match("interactiv") or heading:match("interaction") then
        skipped_heading_level = block.level
      end
    end

    if skipped_heading_level then
      keep = false
    end

    if keep and table_close_expected then
      table_close_expected = false

      if block.t == "Para" and pandoc.utils.stringify(block.content) == ":::" then
        keep = false
      end
    end

    if keep and pending_table then
      if block.t ~= "Table" then
        error("MyST table directive was not followed by a Markdown table")
      end

      block.caption.long = {pandoc.Plain(pending_table.caption)}
      if pending_table.name then
        block.attr.identifier = pending_table.name
      end

      pending_table = nil
      table_close_expected = true
    elseif keep then
      local directive = read_table_directive(block)

      if directive then
        pending_table = directive
        keep = false
      end
    end

    if keep then
      table.insert(result, block)
    end
  end

  if pending_table then
    error("MyST table directive was not followed by a Markdown table")
  end

  document.blocks = result
  return document
end
