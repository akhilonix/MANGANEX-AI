from app.ml import Models

if __name__ == "__main__":
    models = Models(train=True)
    models.save()
    print("MANGANEX ML models trained and saved to backend/models/")
