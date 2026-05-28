import { ROLES } from "./data/roles.js";
import { PROFESSIONS } from "./data/professions.js";
import { createGeneratedNpc } from "./generator.js";

const MODULE_ID = "pf2e-npc-forge";

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | bereit`);

  game.pf2eNpcForge = {
    open: openNpcForge
  };
});

async function openNpcForge() {
  const roleOptions = Object.entries(ROLES)
    .map(([key, role]) => `<option value="${key}">${role.label}</option>`)
    .join("");

  const professionOptions = Object.entries(PROFESSIONS)
    .map(([key, profession]) => `<option value="${key}">${profession.label}</option>`)
    .join("");

  const content = `
    <form>
      <div class="form-group">
        <label>Name</label>
        <input name="name" type="text" value="NSC" />
      </div>

      <div class="form-group">
        <label>Stufe</label>
        <input name="level" type="number" value="1" min="-1" max="25" />
      </div>

      <div class="form-group">
        <label>Rolle</label>
        <select name="role">
          ${roleOptions}
        </select>
      </div>

      <div class="form-group">
        <label>Beruf</label>
        <select name="profession">
          ${professionOptions}
        </select>
      </div>
    </form>
  `;

  new foundry.applications.api.DialogV2({
    window: {
      title: "PF2e NPC Forge"
    },
    content,
    buttons: [
      {
        action: "create",
        label: "NPC erstellen",
        default: true,
        callback: async (event, button) => {
          const form = button.form;

          await createGeneratedNpc({
            name: form.name.value || "NSC",
            level: Number(form.level.value || 1),
            role: form.role.value,
            profession: form.profession.value
          });
        }
      },
      {
        action: "cancel",
        label: "Abbrechen"
      }
    ]
  }).render(true);
}
