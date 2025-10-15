import pandas as pd
from ..services import database_service as db

def create_model_ready_features_from_sql(source_table_name: str) -> pd.DataFrame:
    """
    Creates a wide table containing 8 competency scores for each 'id' 
    using raw scenario data from the given source table.
    This operation is performed through SQL query.
    """
    
    MODEL_READY_SQL = f"""
WITH BaseData AS (
    WITH RankedOptions AS (
        SELECT
            scenarioid,
            score,
            ROW_NUMBER() OVER(PARTITION BY scenarioid ORDER BY scenariooptionid) AS option_rank
        FROM scenariooption
    ),
    UnpivotedData AS (
        SELECT
            p.id,
            p.personaadi,
            CAST(SUBSTRING(s.scenario_column FROM 8) AS INTEGER) AS scenario_id,
            CASE UPPER(TRIM(s.option_letter))
                WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 WHEN 'D' THEN 4 WHEN 'E' THEN 5
            END AS given_option_rank
        FROM {source_table_name} p,
        LATERAL (
            VALUES
                ('senaryo1', p.senaryo1), ('senaryo2', p.senaryo2), ('senaryo3', p.senaryo3),
                ('senaryo4', p.senaryo4), ('senaryo5', p.senaryo5), ('senaryo6', p.senaryo6),
                ('senaryo7', p.senaryo7), ('senaryo8', p.senaryo8), ('senaryo9', p.senaryo9),
                ('senaryo10', p.senaryo10), ('senaryo11', p.senaryo11), ('senaryo12', p.senaryo12),
                ('senaryo13', p.senaryo13), ('senaryo14', p.senaryo14), ('senaryo15', p.senaryo15),
                ('senaryo16', p.senaryo16)
        ) AS s(scenario_column, option_letter)
    ),
    DiagnosticResult AS (
        SELECT
            ud.id,
            ud.personaadi,
            c.name AS seneryo_yetkinligi,
            ro.score
        FROM UnpivotedData ud
        JOIN scenario s ON ud.scenario_id = s.scenarioid
        JOIN competency c ON s.competencyid = c.competencyid
        LEFT JOIN RankedOptions ro ON ud.scenario_id = ro.scenarioid AND ud.given_option_rank = ro.option_rank
    )
    SELECT id, personaadi, seneryo_yetkinligi, score
    FROM DiagnosticResult
    WHERE score IS NOT NULL
),
AveragedScores AS (
    SELECT id, personaadi, seneryo_yetkinligi, AVG(score) AS ortalama_puan
    FROM BaseData
    GROUP BY id, personaadi, seneryo_yetkinligi
)
SELECT
    id,
    personaadi AS persona,
    MAX(CASE WHEN seneryo_yetkinligi = 'Analitik Düşünme' THEN ortalama_puan END) AS "Analitik Düşünme",
    MAX(CASE WHEN seneryo_yetkinligi = 'Sayısal Zeka' THEN ortalama_puan END) AS "Sayısal Zeka",
    MAX(CASE WHEN seneryo_yetkinligi = 'Stres Yönetimi' THEN ortalama_puan END) AS "Stres Yönetimi",
    MAX(CASE WHEN seneryo_yetkinligi = 'Empati' THEN ortalama_puan END) AS "Empati",
    MAX(CASE WHEN seneryo_yetkinligi = 'Takım Çalışması' THEN ortalama_puan END) AS "Takım Çalışması",
    MAX(CASE WHEN seneryo_yetkinligi LIKE 'Hızlı ve Soğukkanlı Karar Al%' THEN ortalama_puan END) AS "Hızlı ve Soğukkanlı Karar Alma",
    MAX(CASE WHEN seneryo_yetkinligi = 'Duygusal Dayanıklılık' THEN ortalama_puan END) AS "Duygusal Dayanıklılık",
    MAX(CASE WHEN seneryo_yetkinligi = 'Teknoloji Adaptasyonu' THEN ortalama_puan END) AS "Teknoloji Adaptasyonu"
FROM AveragedScores
GROUP BY id, personaadi
ORDER BY id;
    """
    
    print(f"Calculating competency scores from '{source_table_name}' table...")
    model_ready_df = db.fetch_dataframe(MODEL_READY_SQL)
    print("Calculation completed.")
    return model_ready_df