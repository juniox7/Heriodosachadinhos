# Biblioteca de prompts — Flow / Omni / Nano Banana

Esta é a biblioteca principal do projeto. Os prompts foram escritos em inglês porque os modelos de vídeo costumam obedecer melhor aos movimentos dessa forma.

## Regras de uso

- **Foto 1:** modelo e ambiente que devem ser preservados.
- **Foto 2:** referência exclusiva da roupa.
- Para imagens, selecione formato vertical **9:16** e gere **uma saída**.
- Para vídeos, use a imagem final como **primeiro frame**, formato **9:16** e **uma saída**.
- Movimentos pequenos geram menos deformações em rosto, mãos, celular e tecido.
- Não altere vários elementos no mesmo comando além da roupa e da variação controlada da cama.

## Escolha rápida

| Roupa | Prompt recomendado |
|---|---|
| Vestido curto | Vídeo 2 ou 3 |
| Vestido longo | Vídeo 2 |
| Conjunto | Vídeo 4 |
| Fitness | Vídeo 5 |
| Short e top | Vídeo 6 |
| Calça ou jeans | Vídeo 7 |
| Casaco ou jaqueta | Vídeo 8 |
| Blusa ou cropped | Vídeo 9 |
| Saia | Vídeo 10 |

---

# IMAGENS — NANO BANANA / OMNI

## Imagem 1 — Trocar somente a roupa

```text
Use Image 1 as the immutable primary reference for the woman, identity, pose, composition and environment. Use Image 2 exclusively as the clothing reference.

Replace only the clothing worn by the woman in Image 1 with the exact garment or complete outfit shown in Image 2.

Preserve exactly the woman from Image 1: facial identity, face shape, skin tone, eyes, eyebrows, nose, lips, expression, glasses, hairstyle, hair color, body shape, body proportions, height, pose, posture, arms, hands, fingers and legs. Do not move, rotate or reposition the woman.

Preserve exactly the phone, jewelry, accessories, shoes, camera angle, mirror perspective, framing, crop, bedroom, furniture, walls, lighting, shadows, colors, depth of field and image quality from Image 1.

Reproduce the clothing from Image 2 accurately, including its design, color, pattern, print, neckline, collar, sleeves, straps, zipper, buttons, seams, waistband, length, fabric texture and fit. Adapt it naturally to the existing body and pose with realistic folds, tension, occlusion, lighting and shadows.

Image 2 is a clothing reference only. Do not copy the person, face, body, skin, hair, pose, hands, accessories, background, camera angle or lighting from Image 2.

If Image 2 contains only a top, replace only the top. If it contains only bottoms, replace only the bottoms. If it contains a dress, jumpsuit, set or complete outfit, replace all corresponding clothing.

Do not modify the woman's face, anatomy, body size, waist, breasts, hips, legs, skin, hair, expression or pose. Do not beautify or retouch her. Do not add new accessories, text or unrelated objects.

Generate one highly photorealistic vertical image. Clothing replacement only. Everything else must remain visually unchanged from Image 1.
```

## Imagem 2 — Trocar roupa e variar a cor da cama

```text
Use Image 1 as the immutable primary reference for the woman, identity, pose, composition and environment. Use Image 2 exclusively as the clothing reference.

Replace only the clothing worn by the woman in Image 1 with the exact garment or complete outfit shown in Image 2.

Preserve exactly the woman from Image 1: facial identity, face shape, skin tone, expression, glasses, hairstyle, hair color, body shape, body proportions, pose, posture, arms, hands, fingers and legs. Do not move or reposition her.

Preserve exactly the phone, jewelry, accessories, shoes, camera angle, mirror perspective, framing, bedroom layout, bed position, furniture, walls, lighting, shadows and image quality from Image 1.

BEDDING COLOR VARIATION: Change only the color of the bedsheets, duvet and pillowcases. Randomly select exactly one coordinated palette: cream, beige, warm gray, blush pink, light blue, sage green or soft lavender. Preserve the bed structure, mattress, headboard, pillow positions, fabric folds, wrinkles, lighting and shadows. Do not transfer the bedding color to the woman, clothing, skin, walls or other objects.

Transfer the clothing from Image 2 accurately, preserving its exact design, color, pattern, print, neckline, sleeves, straps, zipper, buttons, seams, waistband, length, fabric texture and fit. Adapt the garment naturally to the existing body and pose.

Image 2 is a clothing reference only. Do not copy the person, face, body, pose, background or lighting from Image 2.

Do not change the woman's identity, anatomy, body proportions, face, hair, expression or pose. Do not add new accessories, text or unrelated objects.

Generate one highly photorealistic vertical image. Apart from the clothing replacement and bedding color variation, everything must remain visually unchanged from Image 1.
```

---

# VÍDEOS — GOOGLE FLOW / OMNI

## Vídeo 1 — Passo real em direção ao espelho

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, glasses, hairstyle, skin tone, body proportions, outfit, fabric details, phone, accessories, bedroom, mirror and lighting.

The woman must complete one real and clearly visible physical step forward toward the mirror. She must not merely lean forward, shift her weight or walk in place.

During the first second, she holds the original pose. Between seconds 1 and 3, she lifts one foot completely off the floor, moves it approximately 30 centimeters forward, plants it firmly and transfers her body weight onto it. Her hips, torso, head and phone physically travel forward with the step. The rear foot remains behind.

Between seconds 3 and 4.5, she settles into the new position and subtly adjusts her posture to showcase the outfit. Between seconds 4.5 and 6, she gently touches her hair, gives a small confident smile and finishes in a relaxed fashion pose.

She must finish noticeably closer to the mirror than where she started. Her reflection should appear approximately 10–15% closer because of physical movement, not digital zoom. Allow a small natural perspective change as the phone moves with her body.

No walking in place, fake step, foot sliding, stationary body, fast walking, full turn, talking, artificial zoom or scene transition. Do not return her to the starting position.

Do not change her face, anatomy, body proportions, hands, phone, clothing design, color, fabric, background or lighting. No extra limbs, new objects or text. Realistic smartphone fashion video.
```

## Vídeo 2 — Vestido: balanço elegante do tecido

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, hairstyle, skin tone, body proportions, dress design, dress color, print, fabric texture, phone, accessories, bedroom, mirror, lighting and framing.

During the first second, she holds the original pose and looks naturally at the phone. Between seconds 1 and 3, she gently shifts her weight to one leg and makes a small graceful side step. Her free hand lightly holds the outer edge of the dress for less than one second and releases it, creating a soft natural fabric sway without lifting the dress excessively.

Between seconds 3 and 4.5, she performs a controlled 15-degree torso rotation to show the side fit and silhouette. Between seconds 4.5 and 6, she returns to a relaxed three-quarter pose and gives a subtle confident smile.

The dress must respond with realistic gravity, folds and fabric motion. Keep the neckline, hem length, print and construction unchanged and clearly visible.

No full spin, no exaggerated skirt lifting, no walking in place, no provocative touching, no talking, no artificial zoom, no camera shake and no scene transition.

Do not change her face, body, hands, phone, dress design, color, length, background or lighting. No extra limbs, fabric morphing, new objects or text. Premium smartphone fashion video.
```

## Vídeo 3 — Vestido curto: pose confiante e giro parcial

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, hair, skin tone, body proportions, short dress, phone, accessories, bedroom, mirror and lighting.

She begins in the original pose. Between seconds 1 and 2.5, she shifts her weight onto one leg and places her free hand naturally near her waist. Between seconds 2.5 and 4, she rotates her torso and hips together by approximately 20 degrees, briefly presenting the side silhouette of the dress while keeping both feet controlled and visible.

Between seconds 4 and 6, she returns only slightly toward the mirror, keeps a relaxed three-quarter pose, lifts her chin gently and gives a small confident smile.

The movement is feminine, tasteful and suitable for TikTok Shop. The dress must remain at its original length and follow the body with realistic folds and tension.

No complete turn, no back-facing pose, no exaggerated hip movement, no dress lifting, no talking, no zoom and no scene transition.

Do not alter her identity, anatomy, hands, phone, dress design, dress length, fabric, room or lighting. No body morphing, extra limbs, new objects or text.
```

## Vídeo 4 — Conjunto: mostrar cintura e caimento

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, face, hairstyle, skin tone, body proportions, complete two-piece outfit, phone, accessories, bedroom, mirror, lighting and framing.

During the first second, she holds the initial pose. Between seconds 1 and 3, she gently shifts her weight and performs one small side step. Her free hand briefly touches the side of the waistband and smooths the fabric once to present the fit, without pulling or changing the garment.

Between seconds 3 and 4.5, she makes a controlled 15-degree torso rotation, keeping the top and bottom clearly visible. Between seconds 4.5 and 6, she relaxes her free hand, looks at her reflection and finishes with a subtle smile.

Maintain the exact relationship between the top and bottom, including waistband height, exposed midriff, colors, prints, seams and fabric texture. Use realistic folds and tension.

No repeated waistband pulling, no complete turn, no walking in place, no talking, no zoom and no scene transition.

Do not alter her face, body proportions, hands, phone, outfit design, colors, room or lighting. No extra limbs, garment morphing, new objects or text.
```

## Vídeo 5 — Fitness: sensual, atlético e elegante

```text
Create a realistic 6-second vertical mirror-selfie fitness fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, glasses, hairstyle, skin tone, body shape, body proportions, fitness outfit, fabric details, phone, accessories, bedroom, mirror and lighting.

During the first second, she holds the original pose and gives a subtle confident smile. Between seconds 1 and 3, she slowly shifts her weight onto one leg, moves the opposite hip slightly outward and places her free hand naturally at the side of her waist. Her shoulders remain relaxed and her posture becomes athletic and confident.

Between seconds 3 and 4.5, she performs a controlled 15-degree torso rotation to show the side fit, waistband and silhouette. Her free hand lightly smooths the waistband once without covering the outfit. Between seconds 4.5 and 6, she returns to a relaxed three-quarter fitness pose and finishes with a soft confident smile.

The movement must be feminine, attractive, athletic, tasteful and suitable for TikTok Shop. Include realistic weight transfer, blinking, breathing, hair movement and stretch in the fitness fabric.

No exaggerated hip movement, provocative touching, deep squat, full turn, walking in place, talking, artificial zoom or scene transition.

Do not change her identity, anatomy, hands, phone, outfit design, colors, logos, fabric, room or lighting. No body morphing, extra limbs, new objects or text.
```

## Vídeo 6 — Short e top: movimento casual de influenciadora

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, face, glasses, hairstyle, skin tone, body proportions, top, shorts, belt, phone, accessories, bedroom, mirror and lighting.

During the first second, she holds the initial pose. Between seconds 1 and 3, she makes one small diagonal step, plants the foot and visibly transfers her weight. Her free arm swings naturally and then rests close to her waist.

Between seconds 3 and 4.5, she lightly touches the side seam or waistband of the shorts once to show the fit. Between seconds 4.5 and 6, she relaxes her arm, looks at the phone and gives a natural friendly smile.

Keep the top and shorts clearly visible. Preserve the exact waist height, hem length, belt, colors, seams and fabric texture. Use realistic clothing movement.

No fake step, foot sliding, repeated adjustment, full turn, talking, zoom, camera shake or scene transition.

Do not change her face, body proportions, hands, phone, clothing, bedroom or lighting. No extra fingers, extra limbs, new objects or text.
```

## Vídeo 7 — Calça ou jeans: destacar corte e silhueta

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, hairstyle, skin tone, body proportions, pants or jeans, top, shoes, phone, accessories, bedroom, mirror and lighting.

During the first second, she holds the original pose. Between seconds 1 and 3, she moves one foot slightly forward and transfers her weight, creating a natural fashion stance that clearly shows the waist, hips and full length of the pants.

Between seconds 3 and 4.5, she performs a subtle 15-degree three-quarter rotation while her free hand briefly rests near a pocket or waistband. Between seconds 4.5 and 6, she returns her hand to a relaxed position and gives a small confident smile.

Keep both legs and the complete pants visible. Preserve the exact rise, cut, pockets, seams, wash, color, hem and fabric texture. Use realistic tension at the knees and hips.

No full turn, no hand entering a nonexistent pocket, no walking in place, no talking, no zoom and no scene transition.

Do not alter her face, anatomy, hands, phone, pants design, color, top, shoes, room or lighting. No fabric morphing, extra limbs, new objects or text.
```

## Vídeo 8 — Casaco ou jaqueta: mostrar frente e lapela

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, hairstyle, skin tone, body proportions, jacket or coat, clothing underneath, phone, accessories, bedroom, mirror and lighting.

During the first second, she holds the original pose. Between seconds 1 and 3, her free hand gently touches one lapel, collar or front edge of the jacket and smooths it once. She does not open, close or change the jacket unless it is already designed that way in the reference image.

Between seconds 3 and 4.5, she makes a small controlled torso rotation to show the jacket's structure and side fit. Between seconds 4.5 and 6, she lowers her hand, returns to a relaxed fashion pose and gives a subtle smile.

Preserve the exact collar, zipper, buttons, pockets, sleeve length, hem, color and material. Include realistic structured fabric motion.

No repeated pulling, no disappearing buttons, no opening transformation, no full turn, no talking, no zoom and no scene transition.

Do not change her face, hands, phone, jacket design, clothing underneath, room or lighting. No extra limbs, new accessories, new objects or text.
```

## Vídeo 9 — Blusa ou cropped: cabelo e detalhe frontal

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, glasses, hairstyle, skin tone, body proportions, top or cropped blouse, bottoms, phone, accessories, bedroom, mirror and lighting.

During the first second, she holds the original pose. Between seconds 1 and 3, she gently shifts her weight and uses her free hand to move a small section of hair away from the neckline, revealing the top more clearly.

Between seconds 3 and 4.5, she subtly rotates her torso by approximately 15 degrees to show the neckline, sleeves and waist fit. Between seconds 4.5 and 6, she lowers her hand, looks naturally at the phone and gives a small confident smile.

Preserve the exact neckline, collar, sleeves, straps, zipper, buttons, print, color, hem and fabric texture. Her hand must not cover the garment for more than one second.

No repeated hair touching, no complete turn, no garment pulling, no talking, no zoom and no scene transition.

Do not alter her face, hair length, body, hands, phone, clothing design, room or lighting. No extra fingers, extra limbs, new objects or text.
```

## Vídeo 10 — Saia: movimento lateral controlado

```text
Create a realistic 6-second vertical mirror-selfie fashion video using the reference image as the exact first frame.

Preserve exactly the same adult woman, facial identity, hairstyle, skin tone, body proportions, skirt, top, shoes, phone, accessories, bedroom, mirror and lighting.

During the first second, she holds the starting pose. Between seconds 1 and 3, she performs one small graceful side step and transfers her weight. The skirt responds with a soft natural sway.

Between seconds 3 and 4.5, she makes a controlled 15-degree torso and hip rotation to present the skirt's waist and silhouette. Her free hand briefly rests near the waist without lifting the skirt. Between seconds 4.5 and 6, she relaxes into a three-quarter pose and smiles subtly.

Preserve the exact waistband, pleats, slit, print, color, length, hem and fabric texture. Use realistic gravity and folds.

No skirt lifting, no full spin, no exaggerated hip movement, no walking in place, no talking, no zoom and no scene transition.

Do not alter her identity, anatomy, hands, phone, skirt design, skirt length, top, room or lighting. No fabric morphing, extra limbs, new objects or text.
```

---

# Bloco de correção para uma segunda tentativa

Se o primeiro vídeo quase funcionar, acrescente este bloco ao final do prompt original:

```text
CORRECTION PRIORITY: Complete the requested physical movement clearly while preserving the source woman's identity and the garment exactly. Do not simulate movement by leaning, sliding feet or digitally zooming. Maintain anatomically correct hands and feet, consistent facial features, stable clothing details and realistic contact with the floor throughout every frame.
```

# Controle de variedade

Para evitar que a conta pareça repetitiva, alterne os movimentos nesta ordem:

1. Passo real para a frente.
2. Movimento lateral com giro de 15 graus.
3. Mão no cabelo e pose de três quartos.
4. Ajuste único e rápido na cintura ou tecido.

Evite usar o mesmo movimento em publicações consecutivas.
