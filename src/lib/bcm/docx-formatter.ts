import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  BorderStyle,
} from "docx";

export interface BCMSection {
  title: string;
  content: string[]; // Paragraphes simples pour l'instant
  subsections?: BCMSection[];
  listItems?: string[]; // Liste à puces optionnelle
}

export interface BCMDocumentParams {
  title: string;
  organization: string;
  date: string;
  version?: string;
  sections: BCMSection[];
}

export class BCMDocxFormatter {
  static async generateBuffer(params: BCMDocumentParams): Promise<Buffer> {
    const { title, organization, date, version = "1.0", sections } = params;

    const doc = new Document({
      creator: "S.U.R.V.I.V.E. Resilience",
      title: title,
      description: "Document généré par la plateforme S.U.R.V.I.V.E.",
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            run: {
              font: "Calibri",
              size: 22, // 11pt
            },
            paragraph: {
              spacing: { after: 200 },
            },
          },
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Calibri Light",
              size: 32, // 16pt
              color: "005959", // Brand primary dark
              bold: true,
            },
            paragraph: {
              spacing: { before: 240, after: 120 },
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Calibri Light",
              size: 28, // 14pt
              color: "008080", // Brand primary
              bold: true,
            },
            paragraph: {
              spacing: { before: 200, after: 100 },
            },
          },
        ],
      },
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${organization} - ${title}`,
                      color: "888888",
                      size: 20, // 10pt
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                  border: {
                    bottom: {
                      color: "CCCCCC",
                      space: 1,
                      style: BorderStyle.SINGLE,
                      size: 6,
                    },
                  },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      children: ["Page ", PageNumber.CURRENT, " sur ", PageNumber.TOTAL_PAGES],
                      color: "888888",
                      size: 20,
                    }),
                  ],
                  border: {
                    top: {
                      color: "CCCCCC",
                      space: 1,
                      style: BorderStyle.SINGLE,
                      size: 6,
                    },
                  },
                }),
              ],
            }),
          },
          children: [
            // Page de garde
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { before: 2000, after: 400 },
            }),
            new Paragraph({
              text: organization,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 1000 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Date : ${date}`, size: 24 }),
                new TextRun({ text: `\nVersion : ${version}`, size: 24, break: 1 }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 2000 },
            }),
            new Paragraph({
              text: "Généré automatiquement par S.U.R.V.I.V.E. Resilience",
              alignment: AlignmentType.CENTER,
              pageBreakBefore: false,
            }),
            new Paragraph({
              text: "", // Saut de page
              pageBreakBefore: true,
            }),
            // Table des matières simplifiée ou juste le contenu
            ...this.buildSections(sections, 1),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  private static buildSections(sections: BCMSection[], level: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    for (const section of sections) {
      // Titre de section
      paragraphs.push(
        new Paragraph({
          text: section.title,
          heading:
            level === 1
              ? HeadingLevel.HEADING_1
              : level === 2
              ? HeadingLevel.HEADING_2
              : HeadingLevel.HEADING_3,
        })
      );

      // Contenu texte
      if (section.content && section.content.length > 0) {
        for (const textPara of section.content) {
          paragraphs.push(
            new Paragraph({
              text: textPara,
            })
          );
        }
      }

      // Liste à puces
      if (section.listItems && section.listItems.length > 0) {
        for (const item of section.listItems) {
          paragraphs.push(
            new Paragraph({
              text: item,
              bullet: {
                level: 0,
              },
            })
          );
        }
      }

      // Sous-sections
      if (section.subsections && section.subsections.length > 0) {
        paragraphs.push(...this.buildSections(section.subsections, level + 1));
      }
    }

    return paragraphs;
  }
}
