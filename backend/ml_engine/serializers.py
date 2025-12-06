from rest_framework import serializers


class PredictSerializer(serializers.Serializer):
    descriptions = serializers.ListField(
        child=serializers.CharField(max_length=500),
        min_length=1,
        max_length=100
    )


class PredictionResultSerializer(serializers.Serializer):
    description = serializers.CharField()
    category = serializers.CharField(allow_null=True)
    confidence = serializers.FloatField()


class PredictResponseSerializer(serializers.Serializer):
    predictions = serializers.ListField(child=PredictionResultSerializer())


class TrainSerializer(serializers.Serializer):
    include_user_data = serializers.BooleanField(default=False)


class TrainResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    train_accuracy = serializers.FloatField()
    test_accuracy = serializers.FloatField()
    samples_trained = serializers.IntegerField()
    samples_tested = serializers.IntegerField()


class ModelStatusSerializer(serializers.Serializer):
    model_exists = serializers.BooleanField()
    model_path = serializers.CharField()
    categories = serializers.ListField(child=serializers.CharField())
