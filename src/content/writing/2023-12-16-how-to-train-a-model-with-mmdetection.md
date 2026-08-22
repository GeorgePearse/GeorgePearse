---
title: "How to train a model with MMDetection"
date: 2023-12-16
canonical: "https://medium.com/@george.pearse/how-to-train-a-model-with-mmdetection-8ab6a6fea3f0"
tags: ["data-science", "computer-vision", "pytorch", "machine-learning", "mmdetection"]
---

MMDetection is an excellent tool, I’ve used Detectron2 and Pytorch-Lightning with the torch native faster_rcnn ([https://pytorch.org/vision/main/models/faster_rcnn.html](https://pytorch.org/vision/main/models/faster_rcnn.html)), MMDetection is much more versatile and powerful than both, supports export to ONNX, and continues to receive signficant updates.

There’s also the excellent looking MMDeploy to simplify matching your research and deployment setups which I’ve yet to properly take for a spin ([https://mmdeploy.readthedocs.io/en/latest/03-benchmark/supported_models.html](https://mmdeploy.readthedocs.io/en/latest/03-benchmark/supported_models.html)).

![](/GeorgePearse/writing-images/805026d9fb8fcfaa.png)

_Object Detection, Instance Segmentation, and Panoptic Segmentation_

But, the docs are awful, and it doesn’t yet seem to have the same community built around it as many other popular open-source tools.

You can spend weeks trying to custom implement functionality before realising it was there, perfectly implemented all along, just without a single mention in the docs.

An additional complexity, is that the **MMStack** has a lot of components, **MMEngine,** **MMCV**, and **MMDetection**, and it’s not always obvious where different functionality will be implemented, and so it’s hard to know where to look.

This is a rushed article but I still think it could save people a lot of time

## The Config System

MMDetection is extremely config heavy, the framework takes a config.py style file, full of python dictionaries, and builds the data_loader, augmentations, model etc. from it. It looks a little like this:

```
cfg = Config.fromfile(args.config)
runner = Runner.from_cfg(cfg)
```

If (like me), you don’t want to need to clone the MMDetection repo to get started, and just want to use it as an API, you can instead take the below approach.

```
from mmengine.hub import get_config

cfg = get_config('mmdet::swin/mask-rcnn_swin-t-p4-w7_fpn_amp-ms-crop-3x_coco.py')
runner = Runner.from_cfg(cfg)
```

Both of these are creating all of the below objects (this is taken from the MMEngine docs). [https://mmengine.readthedocs.io/en/latest/examples/train_seg.html](https://mmengine.readthedocs.io/en/latest/examples/train_seg.html)

```
num_classes = 32  # Modify to actual number of categories.

runner = Runner(
    model=MMDeeplabV3(num_classes),
    work_dir='./work_dir',
    train_dataloader=train_dataloader,
    optim_wrapper=dict(
        type=AmpOptimWrapper, optimizer=dict(type=AdamW, lr=2e-4)),
    train_cfg=dict(by_epoch=True, max_epochs=10, val_interval=10),
    val_dataloader=val_dataloader,
    val_cfg=dict(),
    val_evaluator=dict(type=IoU),
    custom_hooks=[SegVisHook('data/CamVid')],
    default_hooks=dict(checkpoint=dict(type='CheckpointHook', interval=1)),
)
runner.train()
```

The docs also lack emphasis on how to neatly train on any dataset, and instead are better built for replicating papers on COCO. The only thing that needs to be editted to train on your own custom dataset, is the config for the dataloader.

The full config looks like the below, it expects three variables

- data_root (both the other paths are relative to this.

- data_prefix (where the images are)

- ann_file (path to the COCO annotations).

Example functional values would be

```
data_root =
ann_file = "annotations/train.json"
data_prefix = dict(img="data/")
```

Where the true paths are:

```
data_root =
ann_file = /annotations/train.json
data_prefix = /data
```

```
dict(
    batch_size=batch_size,
    num_workers=6,
    persistent_workers=True,
    sampler=sampler,
    batch_sampler=None,
    dataset=dict(
        type="CocoDataset",
        data_root=self.data_root,
        ann_file=ann_file,
        data_prefix=dict(img="data/"),
        filter_cfg=dict(filter_empty_gt=filter_empty_gt),
        pipeline=pipeline,
        metainfo=self.metainfo,
    ),
)
```

## How to Train a Model

I tend to use typer instead of python’s argparse for command line scripts, more or less the same functionality, just a little less boiler plate.

```
import typer
from mmengine.hub import get_config

# This is just needed to fix the num_classes in a model
# You'd really hope that there's a better approach
# But I'm not sure, and have yet to see one.
# After a good bit of looking.
def replace_nested_value(dictionary, key_to_replace, new_value):
    if isinstance(dictionary, dict):
        for key, value in dictionary.items():
            if key == key_to_replace:
                dictionary[key] = new_value
            elif isinstance(value, dict):
                replace_nested_value(value, key_to_replace, new_value)
            elif isinstance(value, list):
                for item in value:
                    replace_nested_value(item, key_to_replace, new_value)

def set_num_frozen_stages(model: dict, frozen_stages: int):
    model['backbone']['frozen_stages'] = frozen_stages
    return model

def main(
    data_root: str = '../data',
    data_prefix: str = 'images',
    training_path: str = 'annotations/train.json',
    validation_path: str = 'annotations/validation.json'
    model_architecture_family: str = 'swin',
    training_config: str = "mask-rcnn_swin-t-p4-w7_fpn_amp-ms-crop-3x_coco.py",
    num_classes: int = 10,
    output_directory: str = 'work_dir',
    frozen_stages: int = 3,
):

    # Retrieves the model, its transformations, the corresponding
    # Optimizer etc.
    cfg = get_config(f'mmdet::{model_architecture_family}/{training_config}')

    # Set the number of frozen stages in the model
    cfg.model = set_num_frozen_stages(cfg.model, frozen_stages)

    # Where the config file gets dumped to after it's been
    # Built to simplify reproducing the experiment

    if not os.path.exists(output_directory):
        os.mkdir(output_directory)

    cfg.work_dir = output_directory

    # Just overwriting the config dictionary values
    # The config object is very similar to a python
    # dictionary with a few small differences
    cfg.train_dataloader.dataset.data_root = data_root
    cfg.train_dataloader.dataset.ann_file = training_path
    cfg.train_dataloader.dataset.data_prefix = dict(img=data_prefix)

    cfg.val_dataloader.dataset.data_root = data_root
    cfg.val_dataloader.dataset.ann_file = training_path
    cfg.val_dataloader.dataset.data_prefix = dict(img=data_prefix)

    # Change the number of classes in the model
    # Often needs to modify an integer in multiple heads
    # e.g in both the Mask Head and a BBox Head
    # To cover all architectures, this needs to be generic
    # Wouldn't be surprising if there's a neater way to achieve
    # This with built in tooling, but I haven't found it yet
    replace_nested_value(cfg.model, 'num_classes', num_classes)

    runner = Runner.from_cfg(cfg)
    runner.train()

if __name__ == '__main__':
   typer.run(main)
```

## How to Run Inference

The inference API is also awfully tucked away, and under documented.

```
from mmdet.apis import DetInferencer

inferencer = DetInferencer(
    model=config_path,
    weights=weights_path,
)

results = inferencer(
    file_paths, # list of file_paths
    return_vis=False,
    batch_size=batch_size,
    no_save_pred=True,
    pred_score_thr=threshold,
    no_save_vis=True,
    out_dir="outputs",
)
```

There’s a great list of all of the available config values here [https://mmdetection.readthedocs.io/en/dev-3.x/user_guides/config.html](https://mmdetection.readthedocs.io/en/dev-3.x/user_guides/config.html)

Please message me if you try any of this code and have any problems. I have written this quickly out of frustration and the knowledge that I wouldn’t write anything if I didn’t write quickly.

Error messages from MMDetection tend to be cryptic at best. You have been warned.

Let me know if you want more MMDetection tutorials and reach out directly with any questions.
