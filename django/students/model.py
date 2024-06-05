from django.http import JsonResponse
import json
import numpy as np
import pandas as pd

# Функция для подбора команды
def find_the_best_team(df_test_proj_skills, df_students, df_clusters, df_edges):
    max_skills = {}
    for edge in df_edges:
        cluster = edge['Source']
        target = edge['Target']
        weight = edge['Weight']

        if (cluster, target) not in max_skills:
            max_skills[(cluster, target)] = weight
        else:
            max_skills[(cluster, target)] = max(max_skills[(cluster, target)], weight)

    max_skills_df = np.array([[cluster, target, weight] for (cluster, target), weight in max_skills.items()])
    
    final_array = []
    for item in max_skills_df:
        target = item[1]
        coef = [row['coef'] for row in df_test_proj_skills if row['id'] == target]
        weighted_coef = int(item[2]) * coef
        final_array.append([item[0], weighted_coef])

    result = {}
    for item in final_array:
        key = item[0]
        value = sum(item[1])
        if key in result:
            result[key] += value
        else:
            result[key] = value


    df_clusters = json.loads(df_clusters)
    df_cluss = {item['node']: item['cluster'] for item in df_clusters}

    itog_array = []
    for cluster in set(df_cluss.values()):
        team = [row['name'] for row in df_students if row['student_id'] in [item for item in df_cluss.values() if item == cluster]]
        
        try:
            coef = [result[key] for key, value in df_cluss.items() if value == cluster]
        except KeyError:
            continue

        itog_array.append([cluster, sum(coef)])

    itog_array.sort(key=lambda x: x[1], reverse=True)
    
    result_json = []
    for i in range(len(itog_array)):  # Вернуть все результаты
        clust = itog_array[i][0]
        result_json.append([item['node'] for item in df_clusters if item['cluster'] == clust])


    return json.dumps(result_json)