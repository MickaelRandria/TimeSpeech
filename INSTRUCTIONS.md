# À coller EN HAUT de ton prompt principal, avant "You are Claude Code working inside VSCode."

Use the 4 subagents defined in .claude/agents/ for this project. Execute them in this strict order, each one must finish before the next starts:

1. design-system-builder
2. screen-builder
3. flow-integrator
4. qa-reviewer

Do not skip qa-reviewer even if time is short before the demo. It is the step that catches inconsistencies before they show up live in front of the jury.

---

# Corrections à appliquer dans le prompt principal existant

Avant de l'envoyer, fais ces remplacements dans ton prompt original :

1. Remplacer partout "Camille Mercier" par "Julien Bertrand". École inchangée (ESD Bordeaux). Camille est un persona différent déjà utilisé ailleurs dans le projet (enseignante université), Julien est celui construit spécifiquement pour ce scénario vacataire.

2. Remplacer "Font: Montaser Arabic first." et la ligne CSS associée par :
```
Font: Neue Haas Grotesk first. If unavailable, use Inter as fallback.

CSS font family:
font-family: "Neue Haas Grotesk", "Inter", "SF Pro Display", system-ui, sans-serif;
```

3. Dans Screen 6 (Generated course preview), ajouter sous "Durée estimée / 1h58" :
```
Small discreet banner:
"Estimation basée sur un débit standard, sera affinée après calibration."
```

4. Dans Screen 10 (Profile personalization), préciser explicitement dans la description de l'état "Oui, calibrer ma voix" :
```
After showing "142 mots/minute estimés", the course duration shown earlier
(1h58) must visibly update on screen, with a smooth transition, to reflect
the personal calibration. This is the most important visual moment of the
entire demo. Do not leave this as an isolated stat with no connection back
to the course.
```

---

## Pourquoi 4 agents et pas plus

La doc Claude Code recommande de rester à 3-4 subagents maximum sur ce type de projet, au-delà la coordination coûte plus qu'elle ne rapporte. Le découpage suit une logique de dépendance stricte : le design system doit exister avant les écrans, les écrans doivent exister avant le câblage du flow, et la QA ne peut vérifier que ce qui est fini. C'est un pipeline séquentiel, pas du parallèle, parce que chaque étape a vraiment besoin de la précédente terminée.
