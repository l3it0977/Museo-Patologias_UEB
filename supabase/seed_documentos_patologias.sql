-- Inserta las patologías del museo en la tabla documentos_patologias.
-- Ejecutar en: Supabase Dashboard → SQL Editor

INSERT INTO documentos_patologias (titulo, contenido, fecha_creacion) VALUES

('Colon chagásico (Megacolon chagásico)',
'Definición: Alteración del intestino grueso caracterizada por una dilatación anormal y permanente del colon (megacolon) como consecuencia de la enfermedad de Chagas en su fase crónica.
Causa: Infección por el parásito Trypanosoma cruzi, que daña el sistema nervioso entérico (plexos de Auerbach y Meissner) y provoca pérdida de la motilidad intestinal.
Características clínicas: Estreñimiento crónico severo; distensión abdominal; dolor abdominal; acumulación de heces (fecaloma); colon muy dilatado visible en estudios por imagen.
Macroscopía: Colon muy agrandado; pared intestinal adelgazada o a veces engrosada; gran acumulación de contenido fecal.
Microscopía: Destrucción de neuronas del plexo mientérico; disminución o ausencia de ganglios nerviosos; inflamación crónica; fibrosis en la pared intestinal.',
NOW()),

('Leiomioma uterino',
'Definición: Tumor benigno que se origina a partir del músculo liso del útero (miometrio), frecuente en mujeres en edad reproductiva.
Causa: Proliferación anormal de células musculares lisas influida por hormonas, especialmente estrógenos; crecimiento durante la edad fértil y reducción tras la menopausia.
Características clínicas: Masa bien delimitada en el útero; puede ser única o múltiple; consistencia firme; puede causar sangrado menstrual abundante, dolor pélvico y presión sobre órganos vecinos.
Macroscopía: Masa uterina bien delimitada, firme; puede ser única o múltiple y variar en tamaño y localización (submucoso, intramural, subseroso).
Microscopía: Fascículos de músculo liso organizados en remolinos; células uniformes sin atipia; núcleos alargados; ausencia de mitosis anormales.',
NOW()),

('Mioma uterino',
'Definición: Tumor benigno del útero compuesto por tejido muscular y fibroso; término de uso clínico cotidiano equivalente al leiomioma.
Causa: Crecimiento dependiente de hormonas (estrógenos y progesterona) que estimula la proliferación del tejido muscular del útero.
Características clínicas: Localización variable (submucoso, intramural, subseroso); puede deformar el útero; síntomas: sangrado irregular, dolor, y en algunos casos infertilidad.
Macroscopía: Nódulo o masa en la pared uterina que puede protruir hacia la cavidad (submucoso) o hacia la superficie (subseroso); tamaño variable y posible deformación uterina.
Microscopía: Tejido de músculo liso con abundante colágeno organizado en haces; células sin signos de malignidad; baja actividad mitótica.',
NOW()),

('Quiste ovárico',
'Definición: Acumulación de líquido dentro del ovario que forma una cavidad quística.
Causa: Alteraciones en la ovulación, por ejemplo un folículo que no se rompe o que no se reabsorbe.
Características clínicas: Puede ser asintomático; dolor pélvico leve; irregularidad menstrual; a veces hallazgo incidental en ecografía.
Macroscopía: Cavidad quística unilocular o multilocular dentro del ovario, rellena de líquido claro.
Microscopía: Cavidad revestida por epitelio simple; contenido líquido; ausencia de invasión tumoral.',
NOW()),

('Cistoadenoma seroso de ovario',
'Definición: Tumor benigno del ovario formado por quistes llenos de líquido seroso claro, originado del epitelio superficial ovárico.
Causa: Proliferación epitelial anormal del epitelio superficial ovárico, posiblemente influida por factores hormonales.
Características clínicas: Masa quística generalmente unilateral; contenido líquido claro; suele ser asintomático y hallazgo incidental.
Macroscopía: Masa quística unilocular o multilocular en el ovario con contenido seroso claro; superficie lisa.
Microscopía: Epitelio cilíndrico simple ciliado; pared delgada sin atipia; ausencia de invasión (característica benigna).',
NOW()),

('Adenocarcinoma de colon',
'Definición: Tumor maligno del colon originado en las glándulas epiteliales de la mucosa colónica.
Causa: Mutaciones genéticas (APC, KRAS, p53) asociadas a factores como dieta, inflamación crónica o predisposición genética.
Características clínicas: Sangrado rectal; pérdida de peso; cambio en hábitos intestinales; masa o estenosis en colon según la localización.
Macroscopía: Lesión polipoide o ulcerada que infiltra la pared colónica, posible estenosis o masa visible en estudios de imagen o colonoscopia.
Microscopía: Glándulas irregulares infiltrantes; células atípicas con pleomorfismo; producción de moco en algunos casos.',
NOW()),

('Pielonefritis',
'Definición: Infección bacteriana del riñón que afecta la pelvis renal y el parénquima renal.
Causa: Ascenso de bacterias desde las vías urinarias (por ejemplo Escherichia coli) hacia la pelvis renal y parénquima.
Características clínicas: Fiebre; dolor lumbar; disuria; signos sistémicos de infección; en casos crónicos puede haber daño renal persistente.
Macroscopía: Riñón inflamado con áreas de supuración o abscesos; posible aumento de tamaño y cambios en la superficie renal.
Microscopía: Infiltrado neutrofílico intenso; destrucción tubular; formación de microabscesos en el parénquima renal.',
NOW()),

('Colecistitis',
'Definición: Inflamación de la vesícula biliar, generalmente secundaria a obstrucción del conducto cístico.
Causa: Obstrucción del conducto cístico, habitualmente por cálculos biliares que provocan estasis e inflamación.
Características clínicas: Dolor en hipocondrio derecho; náuseas; fiebre; sensibilidad a la palpación en el cuadrante superior derecho.
Macroscopía: Vesícula biliar distendida o inflamada; engrosamiento de la pared; posible presencia de cálculos en la luz vesicular.
Microscopía: Infiltrado inflamatorio en la pared; edema; engrosamiento de la mucosa y posible necrosis en casos severos.',
NOW()),

('Fibrosis pulmonar',
'Definición: Enfermedad crónica en la que el tejido pulmonar se reemplaza progresivamente por tejido fibroso, volviéndose rígido y perdiendo capacidad de intercambio gaseoso.
Causa: Idiopática o secundaria a factores como tabaquismo, contaminación, enfermedades autoinmunes o infecciones crónicas; daño repetido activa fibroblastos que producen colágeno.
Características clínicas: Disnea progresiva; tos seca persistente; disminución de la capacidad pulmonar; en fases avanzadas dedos en palillo de tambor.
Macroscopía: Pulmón duro y retraído con aspecto en panal de abeja en estadios avanzados.
Microscopía: Engrosamiento de tabiques alveolares; fibrosis intersticial difusa; destrucción de la arquitectura pulmonar.',
NOW()),

('Hipertrofia cardíaca',
'Definición: Aumento del tamaño del corazón debido al crecimiento de las células musculares cardíacas (miocitos).
Causa: Respuesta a sobrecarga de trabajo por hipertensión arterial, enfermedades valvulares o cardiopatías crónicas.
Características clínicas: Corazón agrandado; fatiga; disnea; riesgo de progresar a insuficiencia cardíaca.
Macroscopía: Engrosamiento de la pared ventricular, especialmente del ventrículo izquierdo; aumento del tamaño cardíaco.
Microscopía: Miocitos aumentados de tamaño; núcleos grandes en caja; fibrosis intersticial variable.',
NOW()),

('Tumor cerebral (Glioblastoma)',
'Definición: Tumor maligno primario del cerebro altamente agresivo originado en células gliales.
Causa: Mutaciones genéticas en células gliales que alteran el control del crecimiento celular.
Características clínicas: Cefalea intensa; convulsiones; déficits neurológicos progresivos; evolución rápida y mal pronóstico.
Macroscopía: Masa cerebral irregular con áreas de necrosis y hemorragia; infiltración local del tejido cerebral.
Microscopía: Células muy atípicas con pleomorfismo; necrosis con patrón en empalizada; alta actividad mitótica.',
NOW()),

('Embolia pulmonar',
'Definición: Obstrucción de una arteria pulmonar por un émbolo, generalmente un coágulo procedente de venas profundas.
Causa: Trombos venosos profundos que se desprenden y viajan al árbol pulmonar; factores de riesgo: inmovilidad, cirugías, anticonceptivos, trombofilia.
Características clínicas: Disnea súbita; dolor torácico; taquicardia; puede ser mortal si es extensa.
Macroscopía: Zona triangular hemorrágica o infarto pulmonar en el territorio irrigado por la arteria ocluida.
Microscopía: Trombo o coágulo dentro del vaso pulmonar; necrosis y hemorragia del tejido pulmonar adyacente.',
NOW()),

('Aterosclerosis',
'Definición: Enfermedad de las arterias caracterizada por la formación de placas de lípidos y tejido fibroso en la pared arterial.
Causa: Daño endotelial asociado a colesterol alto, tabaquismo, diabetes e hipertensión que favorece la acumulación lipídica y la inflamación crónica.
Características clínicas: Disminución del flujo sanguíneo; riesgo aumentado de infarto de miocardio o accidente cerebrovascular.
Macroscopía: Arterias endurecidas y estrechas con placas visibles en la luz arterial.
Microscopía: Placas lipídicas con macrófagos cargados de lípidos (células espumosas) y fibrosis en la íntima arterial.',
NOW()),

('Hemorragia cerebral',
'Definición: Extravasación de sangre dentro del tejido cerebral por ruptura vascular.
Causa: Hipertensión arterial, ruptura de vasos, traumatismos u otras lesiones vasculares.
Características clínicas: Inicio súbito; pérdida de conciencia; déficits neurológicos focales; cefalea intensa.
Macroscopía: Acumulación de sangre en el parénquima cerebral con efecto de masa y desplazamiento de estructuras.
Microscopía: Sangre fuera de los vasos; daño neuronal y edema circundante.',
NOW()),

('Neumotórax',
'Definición: Aire en la cavidad pleural que provoca colapso parcial o total del pulmón afectado.
Causa: Traumatismos, ruptura espontánea de alveolos o enfermedades pulmonares subyacentes.
Características clínicas: Dolor torácico súbito; disnea; disminución de los ruidos respiratorios en el lado afectado.
Macroscopía: Pulmón colapsado con aire en la cavidad pleural; posible desplazamiento mediastínico si es a tensión.
Microscopía: Colapso alveolar y pérdida de expansión pulmonar en la zona afectada.',
NOW()),

('Insuficiencia cardíaca',
'Definición: Incapacidad del corazón para bombear sangre de forma adecuada para satisfacer las necesidades del organismo.
Causa: Infarto de miocardio, hipertensión, enfermedades valvulares u otras cardiopatías que dañan la función contráctil.
Características clínicas: Disnea; edema periférico en piernas; fatiga; congestión pulmonar y signos de retención hídrica.
Macroscopía: Corazón dilatado con posible hipertrofia y cambios estructurales según la etiología.
Microscopía: Fibrosis intersticial; degeneración de miocitos; cambios celulares asociados a sobrecarga crónica.',
NOW()),

('Cirrosis hepática',
'Definición: Enfermedad crónica del hígado caracterizada por fibrosis difusa y formación de nódulos regenerativos que alteran la arquitectura hepática.
Causa: Consumo crónico de alcohol, hepatitis viral crónica o enfermedades metabólicas que provocan daño hepático progresivo.
Características clínicas: Ictericia; ascitis; fatiga; signos de insuficiencia hepática y complicaciones portal-hipertensivas.
Macroscopía: Hígado nodular y duro con superficie irregular y reducción del volumen funcional.
Microscopía: Fibrosis difusa con nódulos regenerativos y alteración de la arquitectura hepática normal.',
NOW()),

('Osteosarcoma',
'Definición: Tumor maligno del hueso caracterizado por la producción de tejido óseo anormal (osteoide).
Causa: Mutaciones genéticas (p53, RB) que alteran el control del crecimiento celular; más frecuente en jóvenes.
Características clínicas: Dolor óseo progresivo; masa palpable; fracturas patológicas; crecimiento rápido localmente agresivo.
Macroscopía: Lesión ósea destructiva que puede producir masa blanda adyacente y destrucción cortical.
Microscopía: Células malignas pleomórficas que producen osteoide; alta actividad mitótica.',
NOW());
