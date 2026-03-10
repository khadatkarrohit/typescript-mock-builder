import { Project, SyntaxKind, type InterfaceDeclaration, type TypeAliasDeclaration } from 'ts-morph';

export interface ParsedProperty {
  name: string;
  type: string;
  optional: boolean;
}

export interface ParsedInterface {
  name: string;
  properties: ParsedProperty[];
}

export function readInterfaces(filePath: string): ParsedInterface[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(filePath);
  const results: ParsedInterface[] = [];

  for (const iface of sourceFile.getInterfaces()) {
    results.push(parseInterface(iface));
  }

  // Also handle type aliases that are object types
  for (const typeAlias of sourceFile.getTypeAliases()) {
    const typeNode = typeAlias.getTypeNode();
    if (typeNode?.getKind() === SyntaxKind.TypeLiteral) {
      const props: ParsedProperty[] = [];
      for (const member of typeAlias.getType().getProperties()) {
        const decls = member.getDeclarations();
        if (decls.length === 0) continue;
        const decl = decls[0];
        props.push({
          name: member.getName(),
          type: member.getTypeAtLocation(decl).getText(),
          optional: member.isOptional(),
        });
      }
      results.push({ name: typeAlias.getName(), properties: props });
    }
  }

  return results;
}

function parseInterface(iface: InterfaceDeclaration): ParsedInterface {
  const properties: ParsedProperty[] = [];

  for (const prop of iface.getProperties()) {
    properties.push({
      name: prop.getName(),
      type: prop.getType().getText(),
      optional: prop.hasQuestionToken(),
    });
  }

  return { name: iface.getName(), properties };
}
