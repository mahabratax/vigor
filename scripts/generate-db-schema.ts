import { writeFileSync } from 'node:fs';
import { tables, relations, column } from '../db/model.ts';
const ident = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
let code = `// Generated from db/model.ts. Run npm run db:model before db:generate.\nimport { sqliteTable, text, real, integer, primaryKey, foreignKey, uniqueIndex, index, check, AnySQLiteColumn, SQLiteTableExtraConfigValue } from 'drizzle-orm/sqlite-core';\nimport { sql } from 'drizzle-orm';\n`;
for (const { entity: e, parent, mode } of tables) {
  const fields = [
    `gh:text('gh').notNull()`,
    `recordKey:text('record_key').notNull()`,
    `ordinal:integer('ordinal').notNull()`,
  ];
  if (parent) fields.push(`parentKey:text('parent_key').notNull()`);
  if (mode === 'map') fields.push(`mapKey:text('map_key').notNull()`);
  for (const f of e.fields)
    fields.push(
      `${f.name}:${f.type === 'n' ? 'real' : f.type === 'b' ? 'integer' : 'text'}('${column(f.name)}')${!f.optional && !f.nullable ? '.notNull()' : ''}`,
    );
  const rs = relations.filter((r) => r.table === e.table);
  for (const r of rs.filter((r) => r.legacy))
    fields.push(`${r.field}Resolved:text('${column(r.field)}_resolved')`);
  const constraints = [`primaryKey({columns:[t.gh,t.recordKey]})`];
  if (parent)
    constraints.push(
      `foreignKey({columns:[t.gh,t.parentKey],foreignColumns:[${ident(parent)}.gh,${ident(parent)}.recordKey]}).onDelete('cascade')`,
    );
  if (
    e.fields.some((f) => f.name === 'id') &&
    ![
      'routine_steps',
      'run_steps',
      'control_plan_tasks',
      'evidence_followups',
      'evidence_reviews',
    ].includes(e.table)
  )
    constraints.push(`uniqueIndex('${e.table}_gh_id').on(t.gh,t.id)`);
  for (const r of rs) {
    const field = r.field === 'map_key' ? 'mapKey' : r.field;
    constraints.push(
      `foreignKey({columns:[t.gh,t.${field}${r.legacy ? 'Resolved' : ''}],foreignColumns:[${ident(r.target)}.gh,${ident(r.target)}.${r.targetField ?? 'id'}]})`,
    );
    constraints.push(
      `index('${e.table}_${field}_lookup').on(t.gh,t.${field}${r.legacy ? 'Resolved' : ''})`,
    );
  }
  for (const f of e.fields.filter((f) => f.type === 'b'))
    constraints.push(`check('${e.table}_${column(f.name)}_bool',sql\`\${t.${f.name}} in (0, 1)\`)`);
  if (parent) constraints.push(`index('${e.table}_parent_lookup').on(t.gh,t.parentKey)`);
  if (e.table === 'expenses')
    constraints.push(`uniqueIndex('maintenance_expense_once').on(t.gh,t.maintenanceId)`);
  if (e.table === 'planting_batches')
    constraints.push(
      `uniqueIndex('active_batch_per_zone').on(t.gh,t.zoneId).where(sql\`status = 'active'\`)`,
    );
  if (['expenses', 'maintenance_tickets'].includes(e.table))
    constraints.push(`uniqueIndex('${e.table}_submission_once').on(t.gh,t.submissionKey)`);
  if (
    [
      'plant_movements',
      'supply_movements',
      'care_tasks',
      'harvest_lots',
      'sales',
      'receipts',
      'harvest_losses',
      'extra_resource_usage',
    ].includes(e.table)
  )
    constraints.push(`uniqueIndex('${e.table}_request_once').on(t.gh,t.key)`);
  if (
    [
      'device_zones',
      'device_capabilities',
      'routine_version_zones',
      'routine_step_devices',
      'routine_required_devices',
      'routine_optional_devices',
      'nutrient_profile_zones',
      'nutrient_profile_devices',
      'command_devices',
      'baseline_zones',
      'run_step_devices',
    ].includes(e.table)
  )
    constraints.push(`uniqueIndex('${e.table}_membership_once').on(t.gh,t.parentKey,t.value)`);
  const clean = constraints;
  code += `export const ${ident(e.table)} = sqliteTable('${e.table}', {${fields.join(',')}}, (t):SQLiteTableExtraConfigValue[]=>[${clean.join(',')}]);\n`;
}
code += `export const workspaceCommits=sqliteTable('workspace_commits',{revision:integer('revision').primaryKey(),requestId:text('request_id').notNull().unique(),bodyHash:text('body_hash').notNull(),actor:text('actor').notNull(),operation:text('operation').notNull(),resultId:text('result_id'),at:text('at').notNull()});\n`;
code += `export const workspaceMeta=sqliteTable('workspace_meta',{id:integer('id').primaryKey(),nextGreenhouseNumber:integer('next_greenhouse_number').notNull(),seedVersion:integer('seed_version').notNull()});\n`;
code += `export const members=sqliteTable('members',{id:text('id').primaryKey(),principal:text('principal').unique(),name:text('name').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),position:text('position').notNull(),role:text('role').notNull(),active:integer('active').notNull()});\n`;
code += `export const memberGreenhouses=sqliteTable('member_greenhouses',{memberId:text('member_id').notNull().references(()=>members.id,{onDelete:'cascade'}),gh:text('gh').notNull()},t=>[primaryKey({columns:[t.memberId,t.gh]}),foreignKey({columns:[t.gh],foreignColumns:[greenhouses.id]})]);\n`;
// greenhouses.id is globally identical to gh; a unique index makes membership FK valid.
code = code.replace(
  "uniqueIndex('greenhouses_gh_id').on(t.gh,t.id)",
  "uniqueIndex('greenhouses_gh_id').on(t.gh,t.id),uniqueIndex('greenhouse_identity').on(t.id)",
);
code += `export const preferences=sqliteTable('member_preferences',{memberId:text('member_id').primaryKey().references(()=>members.id,{onDelete:'cascade'}),theme:text('theme').notNull(),collapsed:integer('collapsed').notNull(),activeGh:text('active_gh'),inspection:integer('inspection').notNull(),device:integer('device').notNull(),automation:integer('automation').notNull(),expense:integer('expense').notNull()});\n`;
code += `export const notificationReads=sqliteTable('notification_reads',{memberId:text('member_id').notNull().references(()=>members.id,{onDelete:'cascade'}),gh:text('gh').notNull().references(()=>greenhouses.id,{onDelete:'cascade'}),notificationId:text('notification_id').notNull()},t=>[primaryKey({columns:[t.memberId,t.gh,t.notificationId]})]);\n`;
code += `export const guideProgress=sqliteTable('guide_progress',{memberId:text('member_id').notNull().references(()=>members.id,{onDelete:'cascade'}),gh:text('gh').notNull().references(()=>greenhouses.id,{onDelete:'cascade'}),tour:text('tour').notNull(),step:text('step').notNull(),finished:integer('finished').notNull()},t=>[primaryKey({columns:[t.memberId,t.gh,t.tour]})]);\n`;
code += `export const guideSeen=sqliteTable('guide_seen',{memberId:text('member_id').notNull(),gh:text('gh').notNull(),tour:text('tour').notNull(),step:text('step').notNull(),ordinal:integer('ordinal').notNull()},t=>[primaryKey({columns:[t.memberId,t.gh,t.tour,t.step]}),foreignKey({columns:[t.memberId,t.gh,t.tour],foreignColumns:[guideProgress.memberId,guideProgress.gh,guideProgress.tour]}).onDelete('cascade')]);\n`;
code += `export const guideDismissed=sqliteTable('guide_dismissed',{memberId:text('member_id').notNull().references(()=>members.id,{onDelete:'cascade'}),gh:text('gh').notNull().references(()=>greenhouses.id,{onDelete:'cascade'})},t=>[primaryKey({columns:[t.memberId,t.gh]})]);\n`;
writeFileSync('db/schema.ts', code);
