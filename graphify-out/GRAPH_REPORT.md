# Graph Report - tva-calculator-workspace  (2026-05-06)

## Corpus Check
- 169 files · ~81,225 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1773 nodes · 2770 edges · 105 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 152|Community 152]]
- [[_COMMUNITY_Community 153|Community 153]]
- [[_COMMUNITY_Community 169|Community 169]]
- [[_COMMUNITY_Community 173|Community 173]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 47 edges
2. `useI18n()` - 38 edges
3. `error()` - 34 edges
4. `getSession()` - 33 edges
5. `Document` - 32 edges
6. `_pop_flag()` - 24 edges
7. `BaseSchemaValidator` - 22 edges
8. `CardDescription()` - 20 edges
9. `Badge()` - 19 edges
10. `Input()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `SettingsPage()` --calls--> `useAuth()`  [INFERRED]
  src/app/dashboard/settings/page.tsx → src/components/auth/AuthProvider.tsx
- `handleRunTests()` --calls--> `runThesisValidation()`  [INFERRED]
  src/components/tax/ThesisPanel.tsx → src/lib/tax-engine.ts
- `handleCSVImport()` --calls--> `Alert()`  [INFERRED]
  src/components/g50/SalariesStep.tsx → src/components/ui/alert.tsx
- `LoginModal()` --calls--> `useAuth()`  [INFERRED]
  src/components/auth/LoginModal.tsx → src/components/auth/AuthProvider.tsx
- `PrivacySettingsPage()` --calls--> `useI18n()`  [INFERRED]
  src/app/dashboard/settings/privacy/page.tsx → src/lib/i18n-context.tsx

## Hyperedges (group relationships)
- **Marketing Mode Skill Suite** — skills_marketing_mode_SKILL, skills_marketing_mode_mode_prompt, skills_marketing_mode_README [INFERRED 0.80]
- **agent-browser CLI Dependencies** — agent_browser_cli, rust, nodejs, npm [EXTRACTED 1.00]

## Communities (174 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (42): POST(), GET(), POST(), POST(), GET(), DELETE(), GET(), POST() (+34 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (48): _collect_shapes(), _collect_shapes_from_slide(), _detect_overlaps(), extract_text_inventory(), _is_cjk(), _is_valid_shape(), _layout_font_size(), main() (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (42): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+34 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (55): check_conversion(), check_docx(), check_pdf(), check_run_hint_style(), check_toc_has_content(), _detect_language(), docx_has_toc_field(), find_toc_field_boundaries() (+47 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (47): analyzeChartImage(), analyzeMultipleStocks(), analyzeStock(), buildDashboardPrompt(), buildReportPrompt(), extractVerdict(), detectMarket(), fetchGlobalMacro() (+39 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (49): check_file(), convert_blueprint(), error(), extract_image(), extract_table(), extract_text(), form_fill(), _load_json_arg() (+41 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (38): _best_font_for_char(), check_missing_glyphs(), content_sanitize(), content_sanitize_cli(), env_check(), font_check(), font_fallback(), _has_glyph() (+30 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (32): check_blank_pages(), check_colors(), check_content_fill_ratio(), check_cover_bleed(), check_font_embedding(), check_formula_overflow(), check_helvetica_in_cjk(), check_last_page_fill() (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (19): CharacterProfile, ConsistencyChecker, ConsistencyIssue, main(), Load all character profiles from the project, Check character mentions in content for inconsistencies, Represents a consistency issue found in the story, Check for inconsistent character relationships (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (34): auto_fit_columns(), Auto-fit column widths based on DATA content (not header).     Headers that exce, _aggregate(), cell_ref(), _check_charts(), cmd(), cmd_audit(), cmd_chart_verify() (+26 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (18): main(), Extract character names from explicit character markers, Find mentions of known characters in content, Parse a chapter/scene file for timeline events, Analyze entire project and build timeline, Represents a single event in the story timeline, Group events by their timepoint, Group events by character appearance (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (27): HTMLParser, _best_generic(), check_html(), check_pdf(), check_tex(), _contrast_ratio(), _extract_color(), _has_generic() (+19 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (12): checkPenalties(), handlePeriodChange(), addPurchase(), checkPenalties(), removePurchase(), Label(), RadioGroup(), RadioGroupItem() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (16): DocxXMLEditor, Add RSID and optionally enable track revisions and update fields in settings.xml, Get the next available change ID by checking all tracked change elements., Ensure w16du namespace is declared on the root element., Ensure w16cex namespace is declared on the root element., Ensure w14 namespace is declared on the root element., Inject RSID, author, and date attributes into DOM nodes where applicable., Replace node with automatic attribute injection. (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (25): check_blank_pages(), check_cover_overflow(), check_font_fallback(), check_heading_levels(), check_image_aspect_ratio(), check_image_overflow(), check_line_spacing(), check_shading_type() (+17 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (28): _classify_lines(), cmd(), code_sanitize(), convert_latex(), _fallback_symbols(), _find_tectonic(), _human_size(), Output (+20 more)

### Community 16 - "Community 16"
Cohesion: 0.1
Nodes (14): _create_line_tracking_parser(), Recursively extract all text content from an element.          Skips text nodes, Replace a DOM element with new XML content.          Args:             elem: def, Insert XML content after a DOM element.          Args:             elem: defused, Insert XML content before a DOM element.          Args:             elem: defuse, Append XML content as a child of a DOM element.          Args:             elem:, Get the next available rId for relationships files., Save the edited XML back to the file.          Serializes the DOM tree and write (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (19): apply_chart_colors(), apply_pie_colors(), copy_style(), create_bar_chart(), create_pie_chart(), font_caption(), get_active_style(), normalize_cell_value() (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (20): _call_zai(), improve_description(), main(), Run `z-ai chat -p` with the prompt and return the text response., Call z-ai to improve the description based on eval results., find_project_root(), main(), Run the full eval set and return results. (+12 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (18): BaseHTTPRequestHandler, build_run(), embed_file(), find_runs(), _find_runs_recursive(), generate_html(), get_mime_type(), _kill_port() (+10 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (12): Document, Add a single comment to comments.xml., Add a single comment to commentsExtended.xml., Add a single comment to commentsIds.xml., Add a single comment to commentsExtensible.xml., Generate XML for comment range start., Generate XML for comment range end with reference run.          Note: w:rsidR is, Generate XML for comment reference run.          Note: w:rsidR is automatically (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (8): handleCSVImport(), I18nProvider(), SettingsPage(), ThesisPanel(), Alert(), Tabs(), TabsList(), TabsTrigger()

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (4): Badge(), CardDescription(), CardFooter(), Skeleton()

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (8): useIsMobile(), Sheet(), SheetDescription(), SheetHeader(), SheetTitle(), SheetTrigger(), SidebarMenuButton(), useSidebar()

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (19): add_toc_placeholders(), _detect_toc_styles(), _ensure_hyperlink_style(), _ensure_toc_styles(), _extract_headings_from_docx(), _fix_fld_char_structure(), _fix_heading_outline_levels(), _fix_update_fields() (+11 more)

### Community 26 - "Community 26"
Cohesion: 0.23
Nodes (16): addBackground(), addElements(), applyEmphasisFont(), calculateWidthCompensation(), checkCharCount(), checkElementBounds(), checkMinFontSize(), checkTextOverlaps() (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.11
Nodes (19): form_annotate(), form_check_bbox(), form_validate(), get_bounding_box_messages(), _normalise_fields_json(), Transform bounding box from image coordinates to PDF coordinates., Accept both the current sheet-based schema and the legacy flat schema.      Curr, Fill a PDF by adding text annotations (FreeText) defined in fields.json. (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (17): apply_palette(), detect_style(), get_palette(), _infer_from_scene(), list_available(), _match_style_keywords(), xlsx skill — Palette System (Style-First Theme Engine) =========================, Step 1: Match explicit style keywords. Returns style name or None. (+9 more)

### Community 29 - "Community 29"
Cohesion: 0.13
Nodes (6): Accordion(), AccordionItem(), AccordionTrigger(), Avatar(), AvatarFallback(), Input()

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (3): formatCurrency(), isExempt(), Separator()

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (12): _condense_xml(), _generate_hex_id(), _generate_rsid(), _pack_document(), Initialize with required RSID and optional author.          Args:             xm, Strip unnecessary whitespace from XML, preserving text content., Generate random 8-character hex ID for para/durable IDs.      Values are constra, Generate random 8-character hex RSID. (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (9): formatCurrency(), generateG50PDF(), createEmptyRow(), DeclarationTab(), formatCurrency(), handleExportExcel(), handlePrintCa12(), handleReset() (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (7): Footer(), useI18n(), PrivacySettingsPage(), ModeToggle(), Checkbox(), ToggleGroup(), ToggleGroupItem()

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (12): body(), bodyNoIndent(), buildAcademicCover(), buildChapter3(), buildChapter5(), buildHeader(), c(), heading1() (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (12): body(), bodyNoIndent(), buildAcademicCover(), buildChapter3(), buildChapter5(), buildHeader(), c(), heading1() (+4 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (9): BaseSchemaValidator, Validate that all XML files are well-formed., Base validator with common validation logic for document files., Validate that namespace prefixes in Ignorable attributes are declared., Validate that specific IDs are unique according to OOXML requirements., Validate that all .rels files properly reference files and that all files are re, Validate that all r:id attributes in XML files reference existing IDs         in, Get the expected relationship type for an element.         First checks the expl (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (17): form_detail(), form_fill_legacy(), _get_field_info(), _get_full_annotation_field_id(), _make_field_dict(), _monkeypatch_pypdf_method(), Write values into a fillable PDF (pikepdf version)., Extract detailed field info from a PdfReader, including radio group aggregation. (+9 more)

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (15): buildPrompts(), callZAI(), charBudget(), chooseDurationMinutes(), countNonWsChars(), ensureSilenceWav(), joinWavsWave(), main() (+7 more)

### Community 39 - "Community 39"
Cohesion: 0.17
Nodes (9): DOCXSchemaValidator, Validate that w:t elements are not within w:del elements.         For some reaso, Validator for Word document XML files against XSD schemas., Count the number of paragraphs in the unpacked document., Count the number of paragraphs in the original docx file., Validate that w:delText elements are not within w:ins elements.         w:delTex, Run all validation checks and return True if all pass., Compare paragraph counts between original and new document. (+1 more)

### Community 40 - "Community 40"
Cohesion: 0.13
Nodes (8): Run all validation checks and return True if all pass., Validate a single XML file against XSD schema, comparing with original., Validate XML files against XSD schemas, showing only new errors compared to orig, Determine the appropriate schema path for an XML file., Preprocess XML to handle mc:Ignorable attribute properly., Validate a single XML file against XSD schema. Returns (is_valid, errors_set)., Get XSD validation errors from a single file in the original document., Remove template tags from XML text nodes and collect warnings.          Template

### Community 41 - "Community 41"
Cohesion: 0.17
Nodes (8): Validator for tracked changes in Word documents., Generate detailed word-level differences using git word diff., Validator for tracked changes in Word documents., Generate word diff using git with character-level precision., Remove tracked changes authored by Z.AI from the XML root., Main validation method that returns True if valid, False otherwise., Extract text content from Word XML, preserving paragraph structure.          Emp, RedliningValidator

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (9): BaseSchemaValidator, PPTXSchemaValidator, Check if a value has the general structure of a UUID., Validate that sldLayoutId elements in slide masters reference valid slide layout, Validator for PowerPoint presentation XML files against XSD schemas., Validate that each slide has exactly one slideLayout reference., Validate that each notesSlide file is referenced by only one slide., Run all validation checks and return True if all pass. (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.16
Nodes (7): Check if an override with given part name exists., Ensure word/_rels/document.xml.rels has comment relationships., Ensure [Content_Types].xml has comment content types., Append to with automatic attribute injection., Validate the document (lightweight check).          Currently performs basic str, Save all modified XML files to disk and copy to destination directory., Add people.xml content type to [Content_Types].xml if not already present.

### Community 44 - "Community 44"
Cohesion: 0.15
Nodes (14): audit_cascade_palette(), audit_palette(), _cascade_to_css(), _cascade_to_reportlab(), _contrast_ratio(), generate_cascade_palette(), Strict audit: mode-specific S/L bounds + WCAG contrast checks.     Returns list, WCAG 2.1 relative luminance from hex color. (+6 more)

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (4): useAuth(), ProtectedRoute(), Sidebar(), UsageBanner()

### Community 46 - "Community 46"
Cohesion: 0.26
Nodes (6): addSale(), checkPenalties(), removeSale(), Table(), TableBody(), TableHeader()

### Community 47 - "Community 47"
Cohesion: 0.15
Nodes (13): _classify_field(), _current_value(), _extra_props(), form_info(), _gather_fields(), Walk the AcroForm field tree iteratively and return a flat list., Return structured JSON describing every form field (pikepdf + check_fillable)., Map a PDF field type token to a human label. (+5 more)

### Community 48 - "Community 48"
Cohesion: 0.19
Nodes (13): compile_blueprint(), derive_intent(), generate_continuous_flow_svg(), generate_generative_svg(), generate_unified_svg(), main(), palette_to_css(), Auto-derive design intent from document title/description.     Scans for theme k (+5 more)

### Community 49 - "Community 49"
Cohesion: 0.2
Nodes (4): GET(), calculateVariance(), runThesisValidation(), handleRunTests()

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (3): LoginModal(), Dialog(), DialogTrigger()

### Community 51 - "Community 51"
Cohesion: 0.23
Nodes (11): generate_grid_svg(), generate_noise_svg(), generate_ordered_texture_svg(), generate_supergraphic_svg(), _prevent_orphan_chars(), Prevent orphan characters at end of paragraphs.     Replace the last space/break, Grid mode: architectural reference grid.     Ultra-faint 1px lines creating unde, Noise mode: feTurbulence grain texture.     Adds tactile paper-like quality. (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.24
Nodes (11): aggregate_results(), calculate_stats(), generate_benchmark(), generate_markdown(), load_run_results(), main(), Aggregate run results into summary statistics.      Returns run_summary with sta, Generate complete benchmark.json from run results. (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (9): collectStats(), convert(), loadPdfLib(), loadPlaywright(), postProcess(), preRenderHooks(), prettyBytes(), resolveChromium() (+1 more)

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (11): agent-browser CLI, Agent Browser Skill, Chrome DevTools Protocol, Headless Browser Automation, Node.js, npm, Rust, Session Management (agent-browser) (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.2
Nodes (10): _parse_align(), _parse_grid_area(), Lightweight markdown → HTML for Glass Canvas. Handles paragraphs, headers, bold,, Parse grid_area from component JSON.     Accepts two formats:       - Array:  [r, Parse align from component JSON.     Format: "vertical / horizontal" where each, Wrap a rendered component in a .grid-item div with grid positioning., Convert a JSON component object into HTML string, wrapped in grid-item., render_component() (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.2
Nodes (10): generate_color_palette(), _hex_to_rgb(), _hsl_to_hex(), _make_role(), Convert HSL (h: 0-360, s: 0-1, l: 0-1) to hex string., Nudge accent hue away from muddy/ugly zones toward attractive neighbors., Convert hex to 'r,g,b' string for rgba() usage., Generative Color Harmony Engine — geometric accent computation + 5 aesthetic mod (+2 more)

### Community 59 - "Community 59"
Cohesion: 0.28
Nodes (7): main(), package_skill(), Check if a path should be excluded from packaging., Package a skill folder into a .skill file.      Args:         skill_path: Path t, should_exclude(), Basic validation of a skill, validate_skill()

### Community 60 - "Community 60"
Cohesion: 0.39
Nodes (6): addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast()

### Community 61 - "Community 61"
Cohesion: 0.32
Nodes (3): AuthProvider(), Providers(), Toaster()

### Community 62 - "Community 62"
Cohesion: 0.36
Nodes (7): condense_xml(), main(), pack_document(), Strip unnecessary whitespace and remove comments., Pack a directory into an Office file (.docx/.pptx/.xlsx).      Args:         inp, Validate document by converting to HTML with soffice., validate_document()

### Community 63 - "Community 63"
Cohesion: 0.32
Nodes (4): Base validator with common validation logic for document files., Validator for Word document XML files against XSD schemas., Validation modules for Word document processing., Validator for PowerPoint presentation XML files against XSD schemas.

### Community 64 - "Community 64"
Cohesion: 0.25
Nodes (4): Add people.xml relationship to document.xml.rels if not already present., Check if a relationship with given target exists., Set up comment infrastructure in unpacked directory.          Args:, Create people.xml if it doesn't exist.

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (8): _assign_floating_meta(), _auto_assign_grid_areas(), _distribute_rows_by_weight(), _estimate_content_weight(), Estimate the visual weight (space needed) of a component based on its content., Assign grid_area to a Floating_Meta component based on its position., Distribute grid rows among content components proportionally to their content we, Auto-assign grid_area to components that don't have one,     based on the archet

### Community 66 - "Community 66"
Cohesion: 0.54
Nodes (7): build_payload(), call_api(), _clean(), load_config(), main(), render_markdown(), _truncate()

### Community 67 - "Community 67"
Cohesion: 0.25
Nodes (8): align_header(), border_header(), fill_header(), font_header(), 11pt header font — text color on primary background., Thin bottom border under header row., Apply header style to a row range., style_header_row()

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (3): ScrollArea(), handleKeyPress(), sendMessage()

### Community 72 - "Community 72"
Cohesion: 0.52
Nodes (6): build_parser(), _cast(), collect_arguments(), invoke(), load_config(), main()

### Community 73 - "Community 73"
Cohesion: 0.38
Nodes (6): check_library(), list_examples(), prune_oldest(), List all blog examples sorted by date (oldest first)., Check library status and recommend pruning if needed., Remove the oldest examples to bring library under limit.

### Community 74 - "Community 74"
Cohesion: 0.29
Nodes (7): border_total(), fill_total(), font_subheader(), 11pt sub-header — primary color text., Medium top border above totals row., Apply totals row style., style_total_row()

### Community 75 - "Community 75"
Cohesion: 0.47
Nodes (5): generate_visual(), get_script_path(), main(), Get the path to the appropriate generation script., Generate a single visual using the appropriate tool.

### Community 76 - "Community 76"
Cohesion: 0.47
Nodes (5): main(), pretty_print_xml(), Unpack an Office file into a directory and pretty-print all XML files., Pretty-print a single XML file in place., unpack_document()

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (6): env_fix(), _probe_python_module(), Check if a Python module is importable and get its version., Check if a Python module is importable and get its version., Auto-install missing Python dependencies., Auto-install missing Python dependencies.

### Community 78 - "Community 78"
Cohesion: 0.33
Nodes (6): convert_office(), _locate_soffice(), Search for a working soffice binary., Convert an office document to PDF via LibreOffice., Search for a working soffice binary., Convert an office document to PDF via LibreOffice.

### Community 79 - "Community 79"
Cohesion: 0.27
Nodes (6): form_render(), meta_brand(), Convert each page of a PDF to a PNG image., Convert each page of a PDF to a PNG image., Add Z.ai branding metadata to PDF documents., Add Z.ai branding metadata to PDF documents.

### Community 80 - "Community 80"
Cohesion: 0.33
Nodes (6): _generate_data_driven_svg(), generate_flow_svg(), _random_bezier_path(), Generate a single flowing bézier curve across the canvas., Flow mode: ultra-wide, ultra-faint bézier curves.     Creates atmospheric depth, Content-Aware SVG: Transform business data arrays into Bézier background curves.

### Community 81 - "Community 81"
Cohesion: 0.6
Nodes (5): create(), createFromImage(), displayResult(), main(), query()

### Community 82 - "Community 82"
Cohesion: 0.33
Nodes (6): _apply(), Auto-detect style from user prompt and switch all color tokens.     Call this BE, Manually select a palette by style name.     Available: professional, warm, eleg, Internal: apply a palette dict to all module-level color tokens., use_palette(), use_palette_explicit()

### Community 83 - "Community 83"
Cohesion: 0.6
Nodes (4): api_post(), log(), E2E Test Suite — Matax TVA Calculator Tests: Calculator, Declaration, i18n, them, run_tests()

### Community 88 - "Community 88"
Cohesion: 0.6
Nodes (4): copy_slide(), main(), Append a copy of slide[index] from src_prs into dst_prs., rearrange_presentation()

### Community 89 - "Community 89"
Cohesion: 0.7
Nodes (4): dimToPx(), main(), parseArgs(), resolveChromium()

### Community 90 - "Community 90"
Cohesion: 0.4
Nodes (5): align_title(), font_title(), 16pt title font — left-aligned, no fill., Apply standard sheet setup:       - hide grid lines       - set margin column A, setup_sheet()

### Community 91 - "Community 91"
Cohesion: 0.4
Nodes (5): fill_data_row(), font_body(), Alternating row: even=white, odd=warm-white., Apply data row style (alternating fill)., style_data_row()

### Community 99 - "Community 99"
Cohesion: 0.5
Nodes (4): calculate_layout(), _divide_vertical(), Calculate positioned layout for named elements.          Args:         elements:, Divide a rectangle into n vertical bands with golden-ratio-inspired proportions.

### Community 100 - "Community 100"
Cohesion: 0.83
Nodes (3): main(), parseArgs(), resolveChromium()

### Community 101 - "Community 101"
Cohesion: 0.67
Nodes (3): generate_html(), main(), Generate HTML report from loop output data. If auto_refresh is True, adds a meta

### Community 102 - "Community 102"
Cohesion: 0.5
Nodes (4): make_chart_title(), Build a chart Title with font baked into <tx><rich><defRPr>/<rPr>.     Ensures W, Set chart title and axis titles using make_chart_title() for     cross-platform, setup_chart_titles()

### Community 103 - "Community 103"
Cohesion: 0.83
Nodes (3): createSystemMessage(), createUserMessage(), generateMessageId()

### Community 108 - "Community 108"
Cohesion: 0.67
Nodes (3): convert_html(), Convert HTML to PDF via node html2pdf.js., Convert HTML to PDF via node html2pdf.js.

### Community 111 - "Community 111"
Cohesion: 0.67
Nodes (3): Marketing Mode README, Marketing Mode Skill, Marketing Mode Prompt

## Knowledge Gaps
- **497 isolated node(s):** `E2E Test Suite — Matax TVA Calculator Tests: Calculator, Declaration, i18n, them`, `BM25 ranking algorithm for text search`, `Lowercase, split, remove punctuation, filter short words`, `Build BM25 index from documents`, `Score all documents against query` (+492 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 22` to `Community 12`, `Community 21`, `Community 23`, `Community 24`, `Community 29`, `Community 30`, `Community 32`, `Community 33`, `Community 45`, `Community 46`, `Community 50`, `Community 57`, `Community 58`, `Community 69`, `Community 70`, `Community 71`, `Community 84`, `Community 85`, `Community 86`, `Community 87`, `Community 93`, `Community 94`, `Community 95`, `Community 104`, `Community 105`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `_apply()` connect `Community 82` to `Community 17`, `Community 5`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `form_fill()` connect `Community 5` to `Community 37`, `Community 6`, `Community 47`, `Community 15`, `Community 82`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `useI18n()` (e.g. with `PrivacySettingsPage()` and `ThesisPanel()`) actually correct?**
  _`useI18n()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `getSession()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`getSession()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Document` (e.g. with `XMLEditor` and `_extract_headings_from_docx()`) actually correct?**
  _`Document` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `E2E Test Suite — Matax TVA Calculator Tests: Calculator, Declaration, i18n, them`, `BM25 ranking algorithm for text search`, `Lowercase, split, remove punctuation, filter short words` to the rest of the system?**
  _497 weakly-connected nodes found - possible documentation gaps or missing edges._